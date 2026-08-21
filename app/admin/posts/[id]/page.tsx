"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Trash2,
  ImageIcon,
  MapPin,
  Calendar,
  Weight,
  DollarSign,
  User,
  AlertCircle,
  RefreshCw,
  Truck,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "@/context/AuthProvider";
import { postService, Post, PostStatus, WasteCategory } from "@/services/post.service";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const CATEGORY_LABEL: Record<WasteCategory, string> = {
  PLASTIC: "Plastic",
  GLASS: "Glass",
  PAPER: "Paper",
  METAL: "Metal",
  ORGANIC: "Organic",
  TEXTILE: "Textile",
  HAZARDOUS: "Hazardous",
  MIXED: "Mixed",
};

const STATUS_BADGE: Record<PostStatus, string> = {
  OPEN: "bg-[#F0FDF4] text-[#006b2c] border-[#006b2c]/20",
  CLAIMED: "bg-blue-50 text-blue-700 border-blue-200",
  COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  DELETED: "bg-red-50 text-red-700 border-red-200",
};

const PICKUP_STATUS_BADGE: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  ASSIGNED: "bg-blue-50 text-blue-700 border-blue-200",
  IN_TRANSIT: "bg-purple-50 text-purple-700 border-purple-200",
  COMPLETED: "bg-[#F0FDF4] text-[#006b2c] border-[#006b2c]/20",
  CANCELED: "bg-red-50 text-red-700 border-red-200",
};

export default function PostDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user: authUser, loading: authLoading } = useAuth();

  const id = params?.id ? Number(params.id) : null;

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
        const data = await postService.getPostById(id);
        if (isMounted) setPost(data);
      } catch (err) {
        console.error("Failed to fetch post", err);
        if (isMounted)
          setError("Failed to load post details. Please try again.");
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
    if (!post || !confirm("Are you sure? This action cannot be undone.")) return;
    setActionLoading(true);
    setError(null);
    try {
      await postService.deletePost(post.id);
      router.push("/admin/posts");
    } catch (err) {
      console.error("Failed to delete post", err);
      setError("Failed to delete post. Please try again.");
      setActionLoading(false);
    }
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
          Invalid post ID.
        </div>
      </div>
    );
  }

  if (error && !post) {
    return (
      <div className="p-6 md:p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      </div>
    );
  }

  if (loading || !post) {
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
          onClick={() => router.push("/admin/posts")}
          className="w-9 h-9 flex items-center justify-center rounded-lg border border-[#bdcaba] bg-white text-[#3e4a3d] hover:bg-[#f2f4f7] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h2 className="text-2xl font-bold text-[#191c1e]">Post Details</h2>
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
              Post Information
            </h3>

            <div className="flex items-start gap-4 mb-6">
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-[#191c1e]">
                  {post.title}
                </h4>
                <p className="text-sm text-[#6e7b6c] mt-1">
                  {post.description || "No description provided"}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <span
                    className={cn(
                      "px-2.5 py-1 rounded-full text-[11px] font-semibold border",
                      STATUS_BADGE[post.status]
                    )}
                  >
                    {post.status}
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold border bg-slate-50 text-slate-600 border-slate-200">
                    {CATEGORY_LABEL[post.category] || post.category}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              {post.price != null && (
                <div>
                  <span className="text-xs text-[#6e7b6c] uppercase tracking-wider flex items-center gap-1">
                    <DollarSign className="w-3 h-3" />
                    Price
                  </span>
                  <p className="mt-1 text-[#191c1e] font-medium">{post.price} DZD</p>
                </div>
              )}
              {post.quantity != null && (
                <div>
                  <span className="text-xs text-[#6e7b6c] uppercase tracking-wider flex items-center gap-1">
                    <Weight className="w-3 h-3" />
                    Estimated Weight
                  </span>
                  <p className="mt-1 text-[#191c1e]">{post.quantity} kg</p>
                </div>
              )}
              {post.avail_start && (
                <div>
                  <span className="text-xs text-[#6e7b6c] uppercase tracking-wider flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Available From
                  </span>
                  <p className="mt-1 text-[#191c1e]">
                    {formatDate(post.avail_start)}
                  </p>
                </div>
              )}
              {post.avail_end && (
                <div>
                  <span className="text-xs text-[#6e7b6c] uppercase tracking-wider flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Available Until
                  </span>
                  <p className="mt-1 text-[#191c1e]">
                    {formatDate(post.avail_end)}
                  </p>
                </div>
              )}
              {(post.latitude != null && post.longitude != null) && (
                <div>
                  <span className="text-xs text-[#6e7b6c] uppercase tracking-wider flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    Location
                  </span>
                  <p className="mt-1 text-[#191c1e]">
                    {post.latitude.toFixed(5)}, {post.longitude.toFixed(5)}
                  </p>
                  {post.address && (
                    <p className="text-xs text-[#6e7b6c] mt-0.5">{post.address}</p>
                  )}
                </div>
              )}
              <div>
                <span className="text-xs text-[#6e7b6c] uppercase tracking-wider flex items-center gap-1">
                  <User className="w-3 h-3" />
                  Author ID
                </span>
                <p className="mt-1 text-[#191c1e]">User #{post.author_id}</p>
              </div>
              <div>
                <span className="text-xs text-[#6e7b6c] uppercase tracking-wider">
                  Created
                </span>
                <p className="mt-1 text-[#191c1e]">
                  {formatDate(post.createdAt)}
                </p>
              </div>
              <div>
                <span className="text-xs text-[#6e7b6c] uppercase tracking-wider">
                  Last Updated
                </span>
                <p className="mt-1 text-[#191c1e]">
                  {formatDate(post.updatedAt)}
                </p>
              </div>
            </div>
          </div>

          {post.images && post.images.length > 0 && (
            <div className="bg-white rounded-xl border border-[#bdcaba] p-6">
              <h3 className="text-base font-semibold text-[#191c1e] mb-4 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-[#6e7b6c]" />
                Images
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {post.images.map((image) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={image.id}
                    src={image.url}
                    alt={`${post.title} - ${image.order + 1}`}
                    className="w-full h-32 object-cover rounded-lg border border-[#bdcaba]"
                  />
                ))}
              </div>
            </div>
          )}

          {post.pickup && (
            <div className="bg-white rounded-xl border border-[#bdcaba] p-6">
              <h3 className="text-base font-semibold text-[#191c1e] mb-4 flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#6e7b6c]" />
                Associated Pickup
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-xs text-[#6e7b6c] uppercase tracking-wider">
                    Pickup ID
                  </span>
                  <p className="mt-1 text-[#191c1e]">#{post.pickup.id}</p>
                </div>
                <div>
                  <span className="text-xs text-[#6e7b6c] uppercase tracking-wider">
                    Status
                  </span>
                  <p className="mt-1">
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded-full text-[11px] font-semibold border",
                        PICKUP_STATUS_BADGE[post.pickup.status] ||
                          PICKUP_STATUS_BADGE.PENDING
                      )}
                    >
                      {post.pickup.status}
                    </span>
                  </p>
                </div>
                <div>
                  <span className="text-xs text-[#6e7b6c] uppercase tracking-wider">
                    Owner ID
                  </span>
                  <p className="mt-1 text-[#191c1e]">
                    User #{post.pickup.owner_id}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-[#6e7b6c] uppercase tracking-wider">
                    Collector ID
                  </span>
                  <p className="mt-1 text-[#191c1e]">
                    {post.pickup.collector_id
                      ? `User #${post.pickup.collector_id}`
                      : "Unassigned"}
                  </p>
                </div>
                {post.pickup.scheduled_at && (
                  <div>
                    <span className="text-xs text-[#6e7b6c] uppercase tracking-wider">
                      Scheduled At
                    </span>
                    <p className="mt-1 text-[#191c1e]">
                      {formatDate(post.pickup.scheduled_at)}
                    </p>
                  </div>
                )}
                {post.pickup.completed_at && (
                  <div>
                    <span className="text-xs text-[#6e7b6c] uppercase tracking-wider">
                      Completed At
                    </span>
                    <p className="mt-1 text-[#191c1e]">
                      {formatDate(post.pickup.completed_at)}
                    </p>
                  </div>
                )}
                {post.pickup.collected_weight != null && (
                  <div>
                    <span className="text-xs text-[#6e7b6c] uppercase tracking-wider">
                      Collected Weight
                    </span>
                    <p className="mt-1 text-[#191c1e]">
                      {post.pickup.collected_weight} kg
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-[#bdcaba] p-6">
            <h3 className="text-base font-semibold text-[#191c1e] mb-4">
              Actions
            </h3>

            {post.status === "DELETED" ? (
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm text-slate-600">
                This post has been deleted. No actions available.
              </div>
            ) : (
              <div className="space-y-2">
                <button
                  onClick={() => router.push(`/citizen/${post.id}`)}
                  className="w-full h-9 px-3 bg-white border border-[#bdcaba] rounded-lg text-sm font-medium text-[#3e4a3d] hover:bg-[#f2f4f7] transition-colors flex items-center justify-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  View Public Page
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
                  Delete Post
                </button>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border border-[#bdcaba] p-6">
            <h3 className="text-base font-semibold text-[#191c1e] mb-4">
              Quick Links
            </h3>
            <div className="space-y-2">
              <button
                onClick={() => router.push("/admin/posts")}
                className="w-full h-8 px-3 text-left text-sm text-[#3e4a3d] hover:bg-[#f2f4f7] rounded-lg transition-colors flex items-center gap-2"
              >
                <ArrowLeft className="w-3 h-3" />
                Back to Posts List
              </button>
              <button
                onClick={() => router.push("/admin/pickups")}
                className="w-full h-8 px-3 text-left text-sm text-[#3e4a3d] hover:bg-[#f2f4f7] rounded-lg transition-colors flex items-center gap-2"
              >
                <Truck className="w-3 h-3" />
                View Pickups
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
