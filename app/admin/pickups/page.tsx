"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  MoreHorizontal,
  Trash2,
  Truck,
  User,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "@/context/AuthProvider";
import { pickupService, Pickup, PickupStatus } from "@/services/pickup.service";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "ALL", label: "All Statuses" },
  { value: "PENDING", label: "Pending" },
  { value: "ASSIGNED", label: "Assigned" },
  { value: "IN_TRANSIT", label: "In Transit" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELED", label: "Canceled" },
];

const STATUS_BADGE: Record<PickupStatus, string> = {
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  ASSIGNED: "bg-blue-50 text-blue-700 border-blue-200",
  IN_TRANSIT: "bg-purple-50 text-purple-700 border-purple-200",
  COMPLETED: "bg-[#F0FDF4] text-[#006b2c] border-[#006b2c]/20",
  CANCELED: "bg-red-50 text-red-700 border-red-200",
};

export default function PickupsPage() {
  const router = useRouter();
  const { user: authUser, loading: authLoading } = useAuth();

  const [pickups, setPickups] = useState<Pickup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [actionMenu, setActionMenu] = useState<number | null>(null);

  const fetchPickups = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await pickupService.getAllPickups();
      setPickups(data);
    } catch (err) {
      console.error("Failed to fetch pickups", err);
      setError("Failed to load pickups. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await pickupService.getAllPickups();
        if (isMounted) setPickups(data);
      } catch (err) {
        console.error("Failed to fetch pickups", err);
        if (isMounted)
          setError("Failed to load pickups. Please check your connection and try again.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredPickups = useMemo(() => {
    return pickups.filter((p) => {
      const postTitle = p.post?.title || "";
      const ownerName = p.owner?.name || "";
      const collectorName = p.collector?.name || "";
      const matchesSearch =
        postTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        collectorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.id.toString().includes(searchTerm);
      const matchesStatus = statusFilter === "ALL" || p.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [pickups, searchTerm, statusFilter]);

  const isAdminGatePassed = !authLoading && !!authUser && authUser.role === "ADMIN";

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
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          Access denied. This page is restricted to administrators.
        </div>
      </div>
    );
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure? This action cannot be undone.")) return;
    try {
      await pickupService.deletePickup(id);
      await fetchPickups();
    } catch (err) {
      console.error("Failed to delete pickup", err);
      alert("Failed to delete pickup. It may have already been removed.");
    }
  };

  return (
    <div className="p-6 md:p-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[#191c1e]">Pickups</h2>
          <p className="text-[#3e4a3d] text-sm">
            {filteredPickups.length} {filteredPickups.length === 1 ? "pickup" : "pickups"} found
          </p>
        </div>
        <button
          onClick={fetchPickups}
          disabled={loading}
          className="h-9 px-4 bg-white border border-[#bdcaba] rounded-lg text-sm font-medium text-[#3e4a3d] hover:bg-[#f2f4f7] flex items-center gap-2 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          Refresh
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6e7b6c]" />
          <input
            type="text"
            placeholder="Search by post title, owner, or collector…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-9 pl-10 pr-3 rounded-lg border border-[#bdcaba] bg-white text-sm text-[#191c1e] placeholder-[#6e7b6c] focus:outline-none focus:ring-2 focus:ring-[#006b2c]/30"
          />
        </div>

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
        {error ? (
          <div className="p-8 text-center">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700 flex items-center gap-2 justify-center">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          </div>
        ) : loading ? (
          <div className="divide-y divide-[#bdcaba]/50">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-4">
                <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        ) : filteredPickups.length === 0 ? (
          <div className="p-10 text-center text-[#6e7b6c]">
            {pickups.length === 0 && !searchTerm && statusFilter === "ALL"
              ? "No pickups found in the system."
              : "No pickups match your filters."}
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#bdcaba] bg-[#f7f9fc] text-xs text-[#6e7b6c] uppercase tracking-wider">
                <th className="px-5 py-3 font-medium">Pickup</th>
                <th className="px-5 py-3 font-medium">Owner</th>
                <th className="px-5 py-3 font-medium">Collector</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium hidden md:table-cell">Scheduled</th>
                <th className="px-5 py-3 font-medium text-right w-20">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-[#bdcaba]/50">
              {filteredPickups.map((pickup) => (
                <tr
                  key={pickup.id}
                  className="hover:bg-[#f2f4f7] transition-colors"
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#006b2c]/10 flex items-center justify-center flex-shrink-0">
                        <Truck className="w-4 h-4 text-[#006b2c]" />
                      </div>
                      <div>
                        <div className="font-medium text-[#191c1e]">
                          {pickup.post?.title || `Pickup #${pickup.id}`}
                        </div>
                        <div className="text-xs text-[#6e7b6c]">
                          #{pickup.id} · {pickup.post?.category || "—"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-[#3e4a3d]">
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-[#6e7b6c]" />
                      <span>{pickup.owner?.name || "Unknown"}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-[#3e4a3d]">
                    {pickup.collector ? (
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-[#6e7b6c]" />
                        <span>{pickup.collector.name}</span>
                      </div>
                    ) : (
                      <span className="text-[#6e7b6c] text-xs">Unassigned</span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded-full text-[11px] font-semibold border",
                        STATUS_BADGE[pickup.status] || STATUS_BADGE.PENDING
                      )}
                    >
                      {pickup.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-[#6e7b6c] text-xs hidden md:table-cell whitespace-nowrap">
                    {pickup.scheduled_at
                      ? new Date(pickup.scheduled_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "—"}
                  </td>
                  <td
                    className="px-5 py-3 text-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="relative inline-block">
                      <button
                        onClick={() =>
                          setActionMenu(actionMenu === pickup.id ? null : pickup.id)
                        }
                        className="p-1 text-[#6e7b6c] hover:text-[#191c1e] hover:bg-[#f2f4f7] rounded transition-colors"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>

                      {actionMenu === pickup.id && (
                        <div className="absolute right-0 z-20 mt-1 w-44 bg-white border border-[#bdcaba] rounded-lg shadow-lg py-1">
                          <button
                            onClick={() => {
                              setActionMenu(null);
                              router.push(`/admin/pickups/${pickup.id}`);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-1.5 text-left text-sm hover:bg-[#f2f4f7] transition-colors text-[#191c1e]"
                          >
                            <Truck className="w-4 h-4" />
                            View Details
                          </button>
                          <button
                            onClick={() => {
                              setActionMenu(null);
                              handleDelete(pickup.id);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-1.5 text-left text-sm hover:bg-red-50 transition-colors text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
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
