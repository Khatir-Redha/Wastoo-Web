"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Trash2,
  Truck,
  User,
  Calendar,
  Weight,
  FileText,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "@/context/AuthProvider";
import { pickupService, Pickup, PickupStatus } from "@/services/pickup.service";
import { postService, Post } from "@/services/post.service";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const STATUS_BADGE: Record<PickupStatus, string> = {
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  ASSIGNED: "bg-blue-50 text-blue-700 border-blue-200",
  IN_TRANSIT: "bg-purple-50 text-purple-700 border-purple-200",
  COMPLETED: "bg-[#F0FDF4] text-[#006b2c] border-[#006b2c]/20",
  CANCELED: "bg-red-50 text-red-700 border-red-200",
};

const formatDate = (dateString: string | null) => {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function PickupDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user: authUser, loading: authLoading } = useAuth();

  const id = params?.id ? Number(params.id) : null;

  const [pickup, setPickup] = useState<Pickup | null>(null);
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const isAdminGatePassed =
    !authLoading && (!!authUser && authUser.role === "ADMIN");

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      if (!id) return;
      setError(null);
      try {
        const pickupData = await pickupService.getPickupById(id);
        if (isMounted) {
          setPickup(pickupData);
          const postData = await postService.getPostById(pickupData.post_id);
          if (isMounted) setPost(postData);
        }
      } catch (err) {
        console.error("Failed to fetch pickup", err);
        if (isMounted)
          setError("Failed to load pickup details. Please try again.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    load();
    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleDelete = async () => {
    if (!pickup || !confirm("Are you sure? This action cannot be undone.")) return;
    setActionLoading(true);
    setError(null);
    try {
      await pickupService.deletePickup(pickup.id);
      router.push("/admin/pickups");
    } catch (err) {
      console.error("Failed to delete pickup", err);
      setError("Failed to delete pickup. Please try again.");
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
            <AlertCircle className="w-4 h-4" />
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
          Invalid pickup ID.
        </div>
      </div>
    );
  }

  if (error && !pickup) {
    return (
      <div className="p-6 md:p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      </div>
    );
  }

  if (loading || !pickup) {
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

  return (
    <div className="p-6 md:p-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.push("/admin/pickups")}
          className="w-9 h-9 flex items-center justify-center rounded-lg border border-[#bdcaba] bg-white text-[#3e4a3d] hover:bg-[#f2f4f7] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h2 className="text-2xl font-bold text-[#191c1e]">Pickup Details</h2>
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
            <h3 className="text-base font-semibold text-[#191c1e] mb-4 flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#6e7b6c]" />
              Pickup Information
            </h3>

            <div className="flex items-start gap-4 mb-6">
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-[#191c1e]">
                  {post?.title || "Loading..."}
                </h4>
                <p className="text-sm text-[#6e7b6c] mt-1">
                  {post?.description || "No description provided"}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <span
                    className={cn(
                      "px-2.5 py-1 rounded-full text-[11px] font-semibold border",
                      STATUS_BADGE[pickup.status]
                    )}
                  >
                    {pickup.status}
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold border bg-slate-50 text-slate-600 border-slate-200">
                    {post?.category || "—"}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-xs text-[#6e7b6c] uppercase tracking-wider">
                  Pickup ID
                </span>
                <p className="mt-1 text-[#191c1e]">#{pickup.id}</p>
              </div>
              <div>
                <span className="text-xs text-[#6e7b6c] uppercase tracking-wider">
                  Post ID
                </span>
                <p className="mt-1 text-[#191c1e]">#{pickup.post_id}</p>
              </div>
              <div>
                <span className="text-xs text-[#6e7b6c] uppercase tracking-wider flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Scheduled At
                </span>
                <p className="mt-1 text-[#191c1e]">
                  {formatDate(pickup.scheduled_at)}
                </p>
              </div>
              <div>
                <span className="text-xs text-[#6e7b6c] uppercase tracking-wider flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Completed At
                </span>
                <p className="mt-1 text-[#191c1e]">
                  {formatDate(pickup.completed_at)}
                </p>
              </div>
              <div>
                <span className="text-xs text-[#6e7b6c] uppercase tracking-wider flex items-center gap-1">
                  <Weight className="w-3 h-3" />
                  Collected Weight
                </span>
                <p className="mt-1 text-[#191c1e]">
                  {pickup.collected_weight != null
                    ? `${pickup.collected_weight} kg`
                    : "—"}
                </p>
              </div>
              <div>
                <span className="text-xs text-[#6e7b6c] uppercase tracking-wider">
                  Created At
                </span>
                <p className="mt-1 text-[#191c1e]">
                  {formatDate(pickup.created_at)}
                </p>
              </div>
              <div>
                <span className="text-xs text-[#6e7b6c] uppercase tracking-wider">
                  Last Updated
                </span>
                <p className="mt-1 text-[#191c1e]">
                  {formatDate(pickup.updated_at)}
                </p>
              </div>
              {pickup.deleted_at && (
                <div>
                  <span className="text-xs text-[#6e7b6c] uppercase tracking-wider">
                    Deleted At
                  </span>
                  <p className="mt-1 text-[#191c1e]">
                    {formatDate(pickup.deleted_at)}
                  </p>
                </div>
              )}
            </div>
          </div>

          {post?.images && post.images.length > 0 && (
            <div className="bg-white rounded-xl border border-[#bdcaba] p-6">
              <h3 className="text-base font-semibold text-[#191c1e] mb-4 flex items-center gap-2">
                Post Images
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {post.images.map((image) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={image.id}
                    src={image.url}
                    alt={`${post?.title || 'post'} - ${image.order + 1}`}
                    className="w-full h-32 object-cover rounded-lg border border-[#bdcaba]"
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-[#bdcaba] p-6">
            <h3 className="text-base font-semibold text-[#191c1e] mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-[#6e7b6c]" />
              Owner
            </h3>
            <div className="text-sm space-y-2">
              <div>
                <span className="text-xs text-[#6e7b6c] uppercase tracking-wider">
                  Name
                </span>
                <p className="mt-1 text-[#191c1e]">{pickup.owner?.name || "Unknown"}</p>
              </div>
              <div>
                <span className="text-xs text-[#6e7b6c] uppercase tracking-wider">
                  Email
                </span>
                <p className="mt-1 text-[#191c1e]">{pickup.owner?.email || "—"}</p>
              </div>
              <div>
                <span className="text-xs text-[#6e7b6c] uppercase tracking-wider">
                  User ID
                </span>
                <p className="mt-1 text-[#191c1e]">#{pickup.owner?.id ?? pickup.owner_id}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#bdcaba] p-6">
            <h3 className="text-base font-semibold text-[#191c1e] mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-[#6e7b6c]" />
              Collector
            </h3>
            {pickup.collector ? (
              <div className="text-sm space-y-2">
                <div>
                  <span className="text-xs text-[#6e7b6c] uppercase tracking-wider">
                    Name
                  </span>
                  <p className="mt-1 text-[#191c1e]">{pickup.collector?.name || "Unknown"}</p>
                </div>
                <div>
                  <span className="text-xs text-[#6e7b6c] uppercase tracking-wider">
                    Email
                  </span>
                  <p className="mt-1 text-[#191c1e]">{pickup.collector?.email || "—"}</p>
                </div>
                <div>
                  <span className="text-xs text-[#6e7b6c] uppercase tracking-wider">
                    User ID
                  </span>
                  <p className="mt-1 text-[#191c1e]">#{pickup.collector?.id ?? pickup.collector_id}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-[#6e7b6c]">Unassigned</p>
            )}
          </div>

          <div className="bg-white rounded-xl border border-[#bdcaba] p-6">
            <h3 className="text-base font-semibold text-[#191c1e] mb-4">
              Actions
            </h3>

            <div className="space-y-2">
              <button
                onClick={() => router.push(`/admin/posts/${pickup.post_id}`)}
                className="w-full h-9 px-3 bg-white border border-[#bdcaba] rounded-lg text-sm font-medium text-[#3e4a3d] hover:bg-[#f2f4f7] transition-colors flex items-center justify-center gap-2"
              >
                <FileText className="w-4 h-4" />
                View Post
              </button>
              <button
                onClick={handleDelete}
                disabled={actionLoading}
                className="w-full h-9 px-3 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                {actionLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                Delete Pickup
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#bdcaba] p-6">
            <h3 className="text-base font-semibold text-[#191c1e] mb-4">
              Quick Links
            </h3>
            <div className="space-y-2">
              <button
                onClick={() => router.push("/admin/pickups")}
                className="w-full h-8 px-3 text-left text-sm text-[#3e4a3d] hover:bg-[#f2f4f7] rounded-lg transition-colors flex items-center gap-2"
              >
                <ArrowLeft className="w-3 h-3" />
                Back to Pickups List
              </button>
              <button
                onClick={() => router.push("/admin/posts")}
                className="w-full h-8 px-3 text-left text-sm text-[#3e4a3d] hover:bg-[#f2f4f7] rounded-lg transition-colors flex items-center gap-2"
              >
                <FileText className="w-3 h-3" />
                View Posts
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
