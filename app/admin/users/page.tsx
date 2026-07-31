"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  MoreHorizontal,
  PauseCircle,
  Ban,
  Trash2,
  User as UserIcon,
  UserCheck,
} from "lucide-react";
import { useAuth } from "@/context/AuthProvider";
import {
  userService,
  User,
  UserRole,
  UserStatusValue,
  GetUsersResponse,
} from "@/services/usersService";
import kycService, { KycDocument, KycStatus } from "@/services/kycService";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const ROLE_OPTIONS: { value: string; label: string }[] = [
  { value: "ALL", label: "All Roles" },
  { value: "CITIZEN", label: "Citizen" },
  { value: "COLLECTOR", label: "Collector" },
  { value: "RECYCLING_CENTER", label: "Recycling Center" },
  { value: "CHARITY", label: "Charity" },
  { value: "ADMIN", label: "Admin" },
  { value: "BUYER", label: "Buyer" },
];

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "ALL", label: "All Statuses" },
  { value: "ACTIVE", label: "Active" },
  { value: "SUSPENDED", label: "Suspended" },
  { value: "BANNED", label: "Banned" },
  { value: "NOT_VERIFIED", label: "Not Verified" },
];

const STATUS_BADGE: Record<UserStatusValue, string> = {
  ACTIVE: "bg-[#F0FDF4] text-[#006b2c] border-[#006b2c]/20",
  SUSPENDED: "bg-amber-50 text-amber-700 border-amber-200",
  BANNED: "bg-red-50 text-red-700 border-red-200",
  NOT_VERIFIED: "bg-slate-100 text-slate-600 border-slate-200",
  DELETED: "bg-red-50 text-red-700 border-red-200",
};

const KYC_BADGE: Record<KycStatus, string> = {
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  VERIFIED: "bg-[#F0FDF4] text-[#006b2c] border-[#006b2c]/20",
  REJECTED: "bg-red-50 text-red-700 border-red-200",
};

const ROLE_LABEL: Record<UserRole, string> = {
  CITIZEN: "Citizen",
  COLLECTOR: "Collector",
  RECYCLING_CENTER: "Recycling Center",
  CHARITY: "Charity",
  ADMIN: "Admin",
  BUYER: "Buyer",
};

export default function UsersPage() {
  const router = useRouter();
  const { user: authUser, loading: authLoading } = useAuth();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [kycLoading, setKycLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [actionMenu, setActionMenu] = useState<number | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data: GetUsersResponse = await userService.getAllUsers();
      setUsers(data.users);
    } catch (error) {
      console.error("Failed to fetch users", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const data: GetUsersResponse = await userService.getAllUsers();
        if (isMounted) setUsers(data.users);
      } catch (error) {
        console.error("Failed to fetch users", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadKyc = async () => {
      const collectors = users.filter(
        (u) => u.role === "COLLECTOR" && !u.kyc_status
      );
      if (collectors.length === 0) return;

      setKycLoading(true);
      try {
        const updates: Record<
          number,
          "PENDING" | "VERIFIED" | "REJECTED" | null
        > = {};

        await Promise.all(
          collectors.map(async (u) => {
            try {
              const kyc: KycDocument | null = await kycService.getUserKyc(u.id);
              updates[u.id] = kyc?.status ?? null;
            } catch {
              updates[u.id] = null;
            }
          })
        );

        if (isMounted) {
          setUsers((prev) =>
            prev.map((u) =>
              updates[u.id] !== undefined
                ? { ...u, kyc_status: updates[u.id] }
                : u
            )
          );
        }
      } catch (error) {
        console.error("Failed to fetch KYC statuses", error);
      } finally {
        if (isMounted) setKycLoading(false);
      }
    };

    loadKyc();
    return () => {
      isMounted = false;
    };
  }, [users]);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
        (u.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
      const matchesRole = roleFilter === "ALL" || u.role === roleFilter;
      const matchesStatus = statusFilter === "ALL" || u.status === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchTerm, roleFilter, statusFilter]);

  const isAdminGatePassed = !authLoading && (!!authUser && authUser.role === "ADMIN");

  if (authLoading || !isAdminGatePassed) {
    if (authLoading) {
      return (
        <div className="p-6 md:p-8">
          <div className="space-y-4">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      );
    }
    return (
      <div className="p-6 md:p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
          <div className="flex items-center gap-2">
            <Ban className="w-4 h-4" />
            Access denied. This page is restricted to administrators.
          </div>
        </div>
      </div>
    );
  }

  const handleSuspend = async (id: number) => {
    try {
      await userService.suspendUser(id);
      await fetchUsers();
    } catch (error) {
      console.error("Failed to suspend user", error);
    }
  };

  const handleBan = async (id: number) => {
    try {
      await userService.banUser(id);
      await fetchUsers();
    } catch (error) {
      console.error("Failed to ban user", error);
    }
  };

  const handleActivate = async (id: number) => {
    try {
      await userService.activateUser(id);
      await fetchUsers();
    } catch (error) {
      console.error("Failed to activate user", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure? This action cannot be undone.")) {
      try {
        await userService.deleteUser(id);
        await fetchUsers();
      } catch (error) {
        console.error("Failed to delete user", error);
      }
    }
  };

  const getActionOptions = (u: User) => {
    const options: {
      label: string;
      icon: React.ReactNode;
      onClick: () => void;
      danger?: boolean;
    }[] = [];

    if (u.status === "ACTIVE" || u.status === "NOT_VERIFIED") {
      options.push({
        label: "Suspend",
        icon: <PauseCircle className="w-4 h-4" />,
        onClick: () => handleSuspend(u.id),
      });
      options.push({
        label: "Ban",
        icon: <Ban className="w-4 h-4" />,
        onClick: () => handleBan(u.id),
        danger: true,
      });
    } else if (u.status === "SUSPENDED") {
      options.push({
        label: "Reactivate",
        icon: <UserCheck className="w-4 h-4" />,
        onClick: () => handleActivate(u.id),
      });
      options.push({
        label: "Ban",
        icon: <Ban className="w-4 h-4" />,
        onClick: () => handleBan(u.id),
        danger: true,
      });
    } else if (u.status === "BANNED") {
      options.push({
        label: "Reactivate",
        icon: <UserCheck className="w-4 h-4" />,
        onClick: () => handleActivate(u.id),
      });
    }

    options.push({
      label: "Delete",
      icon: <Trash2 className="w-4 h-4" />,
      onClick: () => handleDelete(u.id),
      danger: true,
    });

    return options;
  };

  return (
    <div className="p-6 md:p-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[#191c1e]">Users</h2>
          <p className="text-[#3e4a3d] text-sm">
            {filteredUsers.length}{" "}
            {filteredUsers.length === 1 ? "user" : "users"} found
          </p>
        </div>
        <button className="h-9 px-4 bg-[#006b2c] text-white rounded-lg text-sm font-medium hover:bg-[#005320] flex items-center gap-2 transition-colors">
          <UserIcon className="w-4 h-4" />
          Export
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6e7b6c]" />
          <input
            type="text"
            placeholder="Search by name, email, or phone…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-9 pl-10 pr-3 rounded-lg border border-[#bdcaba] bg-white text-sm text-[#191c1e] placeholder-[#6e7b6c] focus:outline-none focus:ring-2 focus:ring-[#006b2c]/30"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="h-9 px-3 rounded-lg border border-[#bdcaba] bg-white text-sm text-[#191c1e] focus:outline-none focus:ring-2 focus:ring-[#006b2c]/30 appearance-none cursor-pointer"
        >
          {ROLE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-9 px-3 rounded-lg border border-[#bdcaba] bg-white text-sm text-[#191c1e] focus:outline-none focus:ring-2 focus:ring-[#006b2c]/30 appearance-none cursor-pointer"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-[#bdcaba] shadow-sm overflow-hidden">
        {loading ? (
          <div className="divide-y divide-[#bdcaba]/50">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-4">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-10 text-center text-[#6e7b6c]">
            No users match your filters.
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#bdcaba] bg-[#f7f9fc] text-xs text-[#6e7b6c] uppercase tracking-wider">
                <th className="px-5 py-3 font-medium">User</th>
                <th className="px-5 py-3 font-medium">Role</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">KYC</th>
                <th className="px-5 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-[#bdcaba]/50">
              {filteredUsers.map((u) => {
                const actionOpts = getActionOptions(u);
                const showKyc = u.role === "COLLECTOR";
                const kycStatus = u.kyc_status;

                return (
                  <tr
                    key={u.id}
                    onClick={() => router.push(`/admin/users/${u.id}`)}
                    className="hover:bg-[#f2f4f7] transition-colors cursor-pointer"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        {u.photo ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={u.photo}
                            alt={u.name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-[#006b2c]/10 flex items-center justify-center">
                            <UserIcon className="w-4 h-4 text-[#006b2c]" />
                          </div>
                        )}
                        <div>
                          <div className="font-medium text-[#191c1e]">
                            {u.name}
                          </div>
                          <div className="text-xs text-[#6e7b6c]">
                            {u.email}
                            {u.phone && <span> · {u.phone}</span>}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-[#3e4a3d]">
                      {ROLE_LABEL[u.role] ?? u.role}
                    </td>
                    <td
                      className="px-5 py-3"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded-full text-[11px] font-semibold border",
                          STATUS_BADGE[u.status] || STATUS_BADGE.NOT_VERIFIED
                        )}
                      >
                        {u.status}
                      </span>
                    </td>
                    <td
                      className="px-5 py-3"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {showKyc ? (
                        kycStatus ? (
                          <span
                            className={cn(
                              "px-2 py-0.5 rounded-full text-[11px] font-semibold border",
                              KYC_BADGE[kycStatus]
                            )}
                          >
                            {kycStatus}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold border bg-slate-100 text-slate-500 border-slate-200">
                            {kycLoading ? "Loading…" : "Not Submitted"}
                          </span>
                        )
                      ) : (
                        <span className="text-[#6e7b6c] text-xs">—</span>
                      )}
                    </td>
                    <td
                      className="px-5 py-3 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="relative inline-block">
                        <button
                          onClick={() =>
                            setActionMenu(
                              actionMenu === u.id ? null : u.id
                            )
                          }
                          className="p-1 text-[#6e7b6c] hover:text-[#191c1e] hover:bg-[#f2f4f7] rounded transition-colors"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>

                        {actionMenu === u.id && (
                          <div className="absolute right-0 z-20 mt-1 w-44 bg-white border border-[#bdcaba] rounded-lg shadow-lg py-1">
                            {actionOpts.map((opt) => (
                              <button
                                key={opt.label}
                                onClick={() => {
                                  setActionMenu(null);
                                  opt.onClick();
                                }}
                                className={cn(
                                  "w-full flex items-center gap-2 px-3 py-1.5 text-left text-sm hover:bg-[#f2f4f7] transition-colors",
                                  opt.danger
                                    ? "text-red-600 hover:bg-red-50"
                                    : "text-[#191c1e]"
                                )}
                              >
                                {opt.icon}
                                {opt.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {actionMenu !== null && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setActionMenu(null)}
        />
      )}
    </div>
  );
}
