"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  Trash2,
  CheckCheck,
  MoreHorizontal,
  Truck,
  Shield,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
  Send,
} from "lucide-react";
import { useAuth } from "@/context/AuthProvider";
import { notificationService, Notification } from "@/services/notificationService";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const TYPE_CONFIG: Record<
  string,
  { icon: typeof Bell; color: string; bg: string; label: string }
> = {
  PICKUP: {
    icon: Truck,
    color: "text-blue-600",
    bg: "bg-blue-50",
    label: "Pickup",
  },
  WALLET: {
    icon: Bell,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    label: "Wallet",
  },
  BADGE: {
    icon: Shield,
    color: "text-purple-600",
    bg: "bg-purple-50",
    label: "Badge",
  },
  CHALLENGE: {
    icon: ShieldCheck,
    color: "text-orange-600",
    bg: "bg-orange-50",
    label: "Challenge",
  },
  MARKETPLACE: {
    icon: Bell,
    color: "text-pink-600",
    bg: "bg-pink-50",
    label: "Marketplace",
  },
  CHARITY: {
    icon: Bell,
    color: "text-teal-600",
    bg: "bg-teal-50",
    label: "Charity",
  },
  SYSTEM: {
    icon: Shield,
    color: "text-amber-600",
    bg: "bg-amber-50",
    label: "System",
  },
  ADMIN: {
    icon: ShieldCheck,
    color: "text-red-600",
    bg: "bg-red-50",
    label: "Admin",
  },
};

function getTypeConfig(type: string) {
  return TYPE_CONFIG[type] || {
    icon: Bell,
    color: "text-gray-500",
    bg: "bg-gray-50",
    label: type,
  };
}

function relativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

export default function NotificationsPage() {
  const router = useRouter();
  const { user: authUser, loading: authLoading } = useAuth();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [actionMenu, setActionMenu] = useState<number | null>(null);

  const isAdminGatePassed = !authLoading && !!authUser && authUser.role === "ADMIN";

  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const fetchNotifications = useCallback(
    async (pageNum: number) => {
      setLoading(true);
      setError(null);
      try {
        const data = await notificationService.getNotifications(pageNum);
        setNotifications(data.notification);
        setTotalCount(data.count);
      } catch (err) {
        console.error("Failed to fetch notifications", err);
        setError("Failed to load notifications. Please check your connection.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchNotifications(page);
  }, [page, fetchNotifications]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications(page);
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error("Failed to mark as read", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error("Failed to mark all as read", err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this notification?")) return;
    try {
      await notificationService.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      setTotalCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Failed to delete notification", err);
    }
  };

  const handleRowClick = async (notification: Notification) => {
    if (!notification.read) {
      await handleMarkAsRead(notification.id);
    }
    if (notification.actionUrl && notification.actionUrl.startsWith("/")) {
      router.push(notification.actionUrl);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

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

  return (
    <div className="p-6 md:p-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[#191c1e]">Notifications</h2>
          <p className="text-[#3e4a3d] text-sm">
            {totalCount} {totalCount === 1 ? "notification" : "notifications"} total
            {unreadCount > 0 && (
              <span className="text-red-600 font-medium"> · {unreadCount} unread</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="h-9 px-4 bg-white border border-[#bdcaba] rounded-lg text-sm font-medium text-[#3e4a3d] hover:bg-[#f2f4f7] flex items-center gap-2 transition-colors"
            >
              <CheckCheck className="w-4 h-4" />
              Mark all as read
            </button>
          )}
          <button
            onClick={() => router.push("/admin/notifications/broadcast")}
            className="h-9 px-4 bg-[#006b2c] text-white rounded-lg text-sm font-medium hover:bg-[#005320] flex items-center gap-2 transition-colors"
          >
            <Send className="w-4 h-4" />
            Broadcast
          </button>
          <button
            onClick={handleRefresh}
            disabled={refreshing || loading}
            className="h-9 px-4 bg-white border border-[#bdcaba] rounded-lg text-sm font-medium text-[#3e4a3d] hover:bg-[#f2f4f7] flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={cn("w-4 h-4", refreshing && "animate-spin")} />
            Refresh
          </button>
        </div>
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
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-4">
                <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 mx-auto bg-[#f2f4f7] rounded-full flex items-center justify-center mb-4">
              <Bell className="w-8 h-8 text-[#6e7b6c]" />
            </div>
            <h3 className="text-lg font-semibold text-[#191c1e] mb-1">
              No notifications yet
            </h3>
            <p className="text-[#6e7b6c] text-sm">
              You will see system alerts, pickup updates, and admin messages here.
            </p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#bdcaba] bg-[#f7f9fc] text-xs text-[#6e7b6c] uppercase tracking-wider">
                <th className="px-5 py-3 font-medium w-12">Type</th>
                <th className="px-5 py-3 font-medium">Title</th>
                <th className="px-5 py-3 font-medium hidden md:table-cell">
                  Body
                </th>
                <th className="px-5 py-3 font-medium">Time</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium text-right w-20">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-[#bdcaba]/50">
              {notifications.map((notification) => {
                const config = getTypeConfig(notification.type);
                const Icon = config.icon;
                const isSystem = notification.type === "SYSTEM";

                return (
                  <tr
                    key={notification.id}
                    onClick={() => handleRowClick(notification)}
                    className={cn(
                      "transition-colors cursor-pointer",
                      isSystem
                        ? "bg-amber-50/40 hover:bg-amber-50"
                        : "hover:bg-[#f2f4f7]",
                      !notification.read && "font-medium"
                    )}
                  >
                    <td className="px-5 py-3">
                      <div
                        className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center",
                          config.bg
                        )}
                      >
                        <Icon className={cn("w-4 h-4", config.color)} />
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-[#191c1e]">{notification.title}</span>
                        {isSystem && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-700 border border-amber-200">
                            SYSTEM
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-[#3e4a3d] hidden md:table-cell">
                      <span className="line-clamp-1">{notification.body}</span>
                    </td>
                    <td className="px-5 py-3 text-[#6e7b6c] text-xs whitespace-nowrap">
                      {relativeTime(notification.created_at)}
                    </td>
                    <td className="px-5 py-3" onClick={(e) => e.stopPropagation()}>
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded-full text-[11px] font-semibold border",
                          notification.read
                            ? "bg-gray-50 text-gray-500 border-gray-200"
                            : "bg-[#F0FDF4] text-[#006b2c] border-[#006b2c]/20"
                        )}
                      >
                        {notification.read ? "Read" : "Unread"}
                      </span>
                    </td>
                    <td
                      className="px-5 py-3 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="relative inline-block">
                        <button
                          onClick={() =>
                            setActionMenu(
                              actionMenu === notification.id ? null : notification.id
                            )
                          }
                          className="p-1 text-[#6e7b6c] hover:text-[#191c1e] hover:bg-[#f2f4f7] rounded transition-colors"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>

                        {actionMenu === notification.id && (
                          <div className="absolute right-0 z-20 mt-1 w-44 bg-white border border-[#bdcaba] rounded-lg shadow-lg py-1">
                            {!notification.read && (
                              <button
                                onClick={() => {
                                  setActionMenu(null);
                                  handleMarkAsRead(notification.id);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-1.5 text-left text-sm hover:bg-[#f2f4f7] transition-colors text-[#191c1e]"
                              >
                                <CheckCheck className="w-4 h-4" />
                                Mark as read
                              </button>
                            )}
                            <button
                              onClick={() => {
                                setActionMenu(null);
                                handleDelete(notification.id);
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
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && !loading && notifications.length > 0 && (
        <div className="flex items-center justify-between mt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="h-9 px-4 bg-white border border-[#bdcaba] rounded-lg text-sm font-medium text-[#3e4a3d] hover:bg-[#f2f4f7] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-sm text-[#6e7b6c]">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="h-9 px-4 bg-white border border-[#bdcaba] rounded-lg text-sm font-medium text-[#3e4a3d] hover:bg-[#f2f4f7] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}

      {actionMenu !== null && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setActionMenu(null)}
        />
      )}
    </div>
  );
}
