"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Ban,
  CheckCircle,
  PauseCircle,
  User as UserIcon,
  Shield,
  AlertCircle,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "@/context/AuthProvider";
import {
  userService,
  User,
  UserStatusValue,
} from "@/services/usersService";
import kycService, { KycStatus, KycQueueItem } from "@/services/kycService";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const STATUS_LABEL: Record<UserStatusValue, string> = {
  ACTIVE: "Active",
  SUSPENDED: "Suspended",
  BANNED: "Banned",
  NOT_VERIFIED: "Not Verified",
  DELETED: "Deleted",
};

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

const ROLE_LABEL: Record<string, string> = {
  CITIZEN: "Citizen",
  COLLECTOR: "Collector",
  RECYCLING_CENTER: "Recycling Center",
  CHARITY: "Charity",
  ADMIN: "Admin",
  BUYER: "Buyer",
};

export default function UserDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user: authUser, loading: authLoading } = useAuth();

  const id = params?.id ? Number(params.id) : null;

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [kycPendingId, setKycPendingId] = useState<number | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmSuspend, setConfirmSuspend] = useState(false);

  const isAdminGatePassed =
    !authLoading && (!!authUser && authUser.role === "ADMIN");

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      if (!id) return;
      setError(null);
      try {
        const data = await userService.getUserDetail(id);
        if (isMounted) setUser(data);
      } catch (err) {
        console.error("Failed to fetch user", err);
        if (isMounted)
          setError("Failed to load user details. Please try again.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    load();
    return () => {
      isMounted = false;
    };
  }, [id]);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      if (!isMounted) return;

      if (!user || user.role !== "COLLECTOR") {
        if (isMounted) setKycPendingId(null);
        return;
      }

      try {
        const queue: KycQueueItem[] = await kycService.getKycQueue();
        if (!isMounted) return;
        const userKyc = queue.find((a) => a.user_id === user.id);
        setKycPendingId(
          userKyc && userKyc.status === "PENDING" ? userKyc.id : null
        );
      } catch {
        if (isMounted) setKycPendingId(null);
      }
    };

    load();
    return () => {
      isMounted = false;
    };
  }, [user]);

  const handleStatusChange = async (status: UserStatusValue) => {
    if (!user) return;
    setActionLoading(true);
    setError(null);
    try {
      const updated = await userService.updateUserStatus(user.id, status);
      setUser(updated);
      setConfirmSuspend(false);
    } catch (err) {
      console.error("Failed to update user status", err);
      setError("Failed to update user status. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="p-6 md:p-8">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-48" />
          </div>
          <Skeleton className="h-80 w-full" />
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

  if (!id) {
    return (
      <div className="p-6 md:p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
          Invalid user ID.
        </div>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="p-6 md:p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      </div>
    );
  }

  if (loading || !user) {
    return (
      <div className="p-6 md:p-8">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-48" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton className="h-80 lg:col-span-2 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

  const isActionable =
    user.status === "ACTIVE" ||
    user.status === "SUSPENDED" ||
    user.status === "NOT_VERIFIED";

  const canSuspend =
    user.status === "ACTIVE" || user.status === "NOT_VERIFIED";

  return (
    <div className="p-6 md:p-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.push("/admin/users")}
          className="w-9 h-9 flex items-center justify-center rounded-lg border border-[#bdcaba] bg-white text-[#3e4a3d] hover:bg-[#f2f4f7] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h2 className="text-2xl font-bold text-[#191c1e]">User Details</h2>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-[#bdcaba] p-6">
            <h3 className="text-base font-semibold text-[#191c1e] mb-4">
              Profile Information
            </h3>
            <div className="flex items-start gap-4 mb-6">
              {user.photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.photo}
                  alt={user.name}
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-[#006b2c]/10 flex items-center justify-center">
                  <UserIcon className="w-8 h-8 text-[#006b2c]" />
                </div>
              )}
              <div>
                <h4 className="text-lg font-semibold text-[#191c1e]">
                  {user.name}
                </h4>
                <p className="text-sm text-[#6e7b6c]">
                  {ROLE_LABEL[user.role] ?? user.role}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <span
                    className={cn(
                      "px-2.5 py-1 rounded-full text-[11px] font-semibold border",
                      STATUS_BADGE[user.status]
                    )}
                  >
                    {STATUS_LABEL[user.status] ?? user.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-xs text-[#6e7b6c] uppercase tracking-wider">
                  Email
                </span>
                <p className="mt-1 text-[#191c1e]">{user.email}</p>
              </div>
              <div>
                <span className="text-xs text-[#6e7b6c] uppercase tracking-wider">
                  Phone
                </span>
                <p className="mt-1 text-[#191c1e]">
                  {user.phone ?? <span className="text-[#6e7b6c]">—</span>}
                </p>
              </div>
              <div>
                <span className="text-xs text-[#6e7b6c] uppercase tracking-wider">
                  Role
                </span>
                <p className="mt-1 text-[#191c1e]">
                  {ROLE_LABEL[user.role] ?? user.role}
                </p>
              </div>
              <div>
                <span className="text-xs text-[#6e7b6c] uppercase tracking-wider">
                  Account Created
                </span>
                <p className="mt-1 text-[#191c1e]">
                  {user.createdAt
                    ? new Date(user.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "—"}
                </p>
              </div>
              {user.provider && (
                <div>
                  <span className="text-xs text-[#6e7b6c] uppercase tracking-wider">
                    Auth Provider
                  </span>
                  <p className="mt-1 text-[#191c1e] capitalize">
                    {user.provider}
                  </p>
                </div>
              )}
              {user.address && (
                <div>
                  <span className="text-xs text-[#6e7b6c] uppercase tracking-wider">
                    Address
                  </span>
                  <p className="mt-1 text-[#191c1e]">{user.address}</p>
                </div>
              )}
            </div>
          </div>

          {user.role === "COLLECTOR" && (
            <div className="bg-white rounded-xl border border-[#bdcaba] p-6">
              <h3 className="text-base font-semibold text-[#191c1e] mb-4 flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#6e7b6c]" />
                Verification Status
              </h3>

              <div className="flex items-center gap-4 mb-4">
                <span
                  className={cn(
                    "px-2.5 py-1 rounded-full text-[11px] font-semibold border",
                    user.kyc_status
                      ? KYC_BADGE[user.kyc_status]
                      : "bg-slate-100 text-slate-500 border-slate-200"
                  )}
                >
                  {user.kyc_status ?? "Not Submitted"}
                </span>
              </div>

              {user.kyc_status === "PENDING" && kycPendingId && (
                <button
                  onClick={() => router.push(`/admin/kyc/${kycPendingId}`)}
                  className="text-sm text-[#006b2c] hover:text-[#005320] font-medium flex items-center gap-1"
                >
                  Review application
                  <ExternalLink className="w-3 h-3" />
                </button>
              )}

              {user.kyc_status && user.kyc_status !== "PENDING" && (
                <p className="text-xs text-[#6e7b6c]">
                  KYC status: {user.kyc_status}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-[#bdcaba] p-6">
            <h3 className="text-base font-semibold text-[#191c1e] mb-4">
              Account Actions
            </h3>

            {!isActionable ? (
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm text-slate-600">
                No actions available for users with DELETED status.
              </div>
            ) : confirmSuspend ? (
              <div className="space-y-3">
                <p className="text-sm text-[#191c1e]">
                  Are you sure you want to suspend{" "}
                  <span className="font-semibold">{user.name}</span>?
                </p>
                <p className="text-xs text-[#6e7b6c]">
                  This will prevent the user from authenticating and using the
                  platform until reactivated.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setConfirmSuspend(false)}
                    disabled={actionLoading}
                    className="flex-1 h-8 px-3 bg-white border border-[#bdcaba] rounded-lg text-sm font-medium text-[#3e4a3d] hover:bg-[#f2f4f7] transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleStatusChange("SUSPENDED")}
                    disabled={actionLoading}
                    className="flex-1 h-8 px-3 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-1"
                  >
                    {actionLoading ? (
                      <RefreshCw className="w-3 h-3 animate-spin" />
                    ) : (
                      <PauseCircle className="w-3 h-3" />
                    )}
                    Confirm Suspend
                  </button>
                </div>
              </div>
            ) : canSuspend ? (
              <button
                onClick={() => setConfirmSuspend(true)}
                disabled={actionLoading}
                className="w-full h-9 px-3 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                <PauseCircle className="w-4 h-4" />
                Suspend Account
              </button>
            ) : (
              <button
                onClick={() => handleStatusChange("ACTIVE")}
                disabled={actionLoading}
                className="w-full h-9 px-3 bg-[#006b2c] text-white rounded-lg text-sm font-medium hover:bg-[#005320] disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                {actionLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
                Reactivate Account
              </button>
            )}
          </div>

          <div className="bg-white rounded-xl border border-[#bdcaba] p-6">
            <h3 className="text-base font-semibold text-[#191c1e] mb-4">
              Quick Links
            </h3>
            <div className="space-y-2">
              <button
                onClick={() => router.push("/admin/users")}
                className="w-full h-8 px-3 text-left text-sm text-[#3e4a3d] hover:bg-[#f2f4f7] rounded-lg transition-colors flex items-center gap-2"
              >
                <ArrowLeft className="w-3 h-3" />
                Back to Users List
              </button>
              {user.role === "COLLECTOR" && (
                <button
                  onClick={() => router.push("/admin/kyc")}
                  className="w-full h-8 px-3 text-left text-sm text-[#3e4a3d] hover:bg-[#f2f4f7] rounded-lg transition-colors flex items-center gap-2"
                >
                  <Shield className="w-3 h-3" />
                  KYC Queue
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
