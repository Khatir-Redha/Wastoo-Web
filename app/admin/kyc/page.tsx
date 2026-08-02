"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  FileText,
  Clock,
  User as UserIcon,
  Ban,
  Eye,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "@/context/AuthProvider";
import kycService, { KycQueueItem, KycStatus } from "@/services/kycService";
import { userService, User } from "@/services/usersService";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const STATUS_BADGE: Record<KycStatus, string> = {
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  VERIFIED: "bg-[#F0FDF4] text-[#006b2c] border-[#006b2c]/20",
  REJECTED: "bg-red-50 text-red-700 border-red-200",
};

const DOC_TYPE_LABEL: Record<"ID" | "PASSPORT", string> = {
  ID: "National ID",
  PASSPORT: "Passport",
};

export default function KycQueuePage() {
  const router = useRouter();
  const { user: authUser, loading: authLoading } = useAuth();

  const [applications, setApplications] = useState<KycQueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const isAdminGatePassed =
    !authLoading && (!!authUser && authUser.role === "ADMIN");

  const fetchQueue = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await kycService.getKycQueue();

      const needsEnrichment = data.some(
        (app) => !app.user_name
      );

      let enriched: KycQueueItem[] = data;

      if (needsEnrichment) {
        try {
          const { users: allUsers } = await userService.getAllUsers();
          const userMap: Record<number, User> = {};
          allUsers.forEach((u) => {
            userMap[u.id] = u;
          });

          enriched = data.map((app) => {
            const userInfo = userMap[app.user_id];
            return {
              ...app,
              user_name: app.user_name ?? userInfo?.name ?? undefined,
              user_email: app.user_email ?? userInfo?.email,
              user_phone: app.user_phone ?? userInfo?.phone ?? null,
            };
          });
        } catch (enrichError) {
          console.error("Failed to enrich KYC queue with user data", enrichError);
        }
      }

      const pending = enriched.filter((app) => app.status === "PENDING");
      setApplications(pending);
    } catch (error) {
      console.error("Failed to fetch KYC queue", error);
      setError(
        "Failed to load KYC queue. Please check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchQueue();
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
       setLoading(true);
      setError(null);
      try {
        const data = await kycService.getKycQueue();

        const needsEnrichment = data.some((app) => !app.user_name);

        let enriched: KycQueueItem[] = data;

        if (needsEnrichment) {
          try {
            const { users: allUsers } = await userService.getAllUsers();
            const userMap: Record<number, User> = {};
            allUsers.forEach((u) => {
              userMap[u.id] = u;
            });

            enriched = data.map((app) => {
              const userInfo = userMap[app.user_id];
              return {
                ...app,
                user_name: app.user_name ?? userInfo?.name ?? undefined,
                user_email: app.user_email ?? userInfo?.email,
                user_phone: app.user_phone ?? userInfo?.phone ?? null,
              };
            });
          } catch (enrichError) {
            console.error(
              "Failed to enrich KYC queue with user data",
              enrichError
            );
          }
        }

        if (isMounted) {
          const pending = enriched.filter((app) => app.status === "PENDING");
          setApplications(pending);
        }
      } catch (error) {
        console.error("Failed to fetch KYC queue", error);
        if (isMounted)
          setError(
            "Failed to load KYC queue. Please check your connection and try again."
          );
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredApplications = useMemo(() => {
    if (!searchTerm) return applications;

    const term = searchTerm.toLowerCase();
    return applications.filter((app) => {
      const nameMatch =
        (app.user_name ?? "").toLowerCase().includes(term);
      const emailMatch =
        app.user_email != null &&
        app.user_email.toLowerCase().includes(term);
      const phoneMatch =
        app.user_phone != null &&
        app.user_phone.toLowerCase().includes(term);
      return nameMatch || emailMatch || phoneMatch;
    });
  }, [applications, searchTerm]);

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

  if (!isAdminGatePassed) {
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

  return (
    <div className="p-6 md:p-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[#191c1e]">KYC Queue</h2>
          <p className="text-[#3e4a3d] text-sm">
            {filteredApplications.length}{" "}
            {filteredApplications.length === 1
              ? "pending application"
              : "pending applications"}
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing || loading}
          className="h-9 px-4 bg-white border border-[#bdcaba] rounded-lg text-sm font-medium text-[#3e4a3d] hover:bg-[#f2f4f7] flex items-center gap-2 transition-colors disabled:opacity-50"
        >
          <RefreshCw
            className={cn("w-4 h-4", refreshing && "animate-spin")}
          />
          Refresh
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6e7b6c]" />
          <input
            type="text"
            placeholder="Search by collector name, email, or phone…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-9 pl-10 pr-3 rounded-lg border border-[#bdcaba] bg-white text-sm text-[#191c1e] placeholder-[#6e7b6c] focus:outline-none focus:ring-2 focus:ring-[#006b2c]/30"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#bdcaba] shadow-sm overflow-hidden">
        {error ? (
          <div className="p-8 text-center">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          </div>
        ) : loading ? (
          <div className="divide-y divide-[#bdcaba]/50">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-4 px-5 py-4"
              >
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 mx-auto bg-[#F0FDF4] rounded-full flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-[#006b2c]/40" />
            </div>
            <h3 className="text-lg font-semibold text-[#191c1e] mb-1">
              No pending KYC applications
            </h3>
            <p className="text-[#6e7b6c] text-sm">
              {searchTerm
                ? "No applications match your search."
                : "All applications have been reviewed. The queue is empty."}
            </p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#bdcaba] bg-[#f7f9fc] text-xs text-[#6e7b6c] uppercase tracking-wider">
                <th className="px-5 py-3 font-medium">Collector</th>
                <th className="px-5 py-3 font-medium">Document</th>
                <th className="px-5 py-3 font-medium">Submitted</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-[#bdcaba]/50">
              {filteredApplications.map((app) => {
                const displayName = app.user_name ?? `User #${app.user_id}`;
                const displayEmail = app.user_email;

                return (
                  <tr
                    key={app.id}
                    onClick={() =>
                      router.push(`/admin/kyc/${app.id}`)
                    }
                    className="hover:bg-[#f2f4f7] transition-colors cursor-pointer"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#006b2c]/10 flex items-center justify-center">
                          <UserIcon className="w-4 h-4 text-[#006b2c]" />
                        </div>
                        <div>
                          <div className="font-medium text-[#191c1e]">
                            {displayName}
                          </div>
                          <div className="text-xs text-[#6e7b6c]">
                            {displayEmail}
                            {app.user_phone && (
                              <span> · {app.user_phone}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-[#3e4a3d]">
                      {DOC_TYPE_LABEL[app.document_type] ??
                        app.document_type}
                    </td>
                    <td className="px-5 py-3 text-[#6e7b6c]">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(app.created_at).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          }
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded-full text-[11px] font-semibold border",
                          STATUS_BADGE[app.status]
                        )}
                      >
                        {app.status}
                      </span>
                    </td>
                    <td
                      className="px-5 py-3 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() =>
                          router.push(`/admin/kyc/${app.id}`)
                        }
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-[#006b2c] bg-[#F0FDF4] border border-[#006b2c]/20 rounded-lg hover:bg-[#e6f4ea] transition-colors"
                      >
                        <Eye className="w-3 h-3" />
                        Review
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
