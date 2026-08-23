"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  MoreHorizontal,
  Trash2,
  Store,
  ImageIcon,
  User,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "@/context/AuthProvider";
import { postService, Post, PostStatus, WasteCategory, PostsResponse } from "@/services/post.service";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const CATEGORY_OPTIONS: { value: string; label: string }[] = [
  { value: "ALL", label: "All Categories" },
  { value: "PLASTIC", label: "Plastic" },
  { value: "GLASS", label: "Glass" },
  { value: "PAPER", label: "Paper" },
  { value: "METAL", label: "Metal" },
  { value: "ORGANIC", label: "Organic" },
  { value: "TEXTILE", label: "Textile" },
  { value: "HAZARDOUS", label: "Hazardous" },
  { value: "MIXED", label: "Mixed" },
];

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "ALL", label: "All Statuses" },
  { value: "OPEN", label: "Open" },
  { value: "CLAIMED", label: "Claimed" },
  { value: "COMPLETED", label: "Completed" },
  { value: "DELETED", label: "Deleted" },
];

const STATUS_BADGE: Record<PostStatus, string> = {
  OPEN: "bg-[#F0FDF4] text-[#006b2c] border-[#006b2c]/20",
  CLAIMED: "bg-blue-50 text-blue-700 border-blue-200",
  COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  DELETED: "bg-red-50 text-red-700 border-red-200",
};

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

export default function MarketplacePage() {
  const router = useRouter();
  const { user: authUser, loading: authLoading } = useAuth();

  const [posts, setPosts] = useState<Post[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [actionMenu, setActionMenu] = useState<number | null>(null);

  const limit = 20;

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const params: Record<string, string | number> = { page, limit };
        if (categoryFilter !== "ALL") params.category = categoryFilter;
        if (statusFilter !== "ALL") params.status = statusFilter;

        const response: PostsResponse = await postService.getAllPosts(params);
        const withPrice = response.data.filter((p) => p.price && p.price > 0);
        if (isMounted) {
          setPosts(withPrice);
          setTotal(withPrice.length);
        }
      } catch (err) {
        console.error("Failed to fetch marketplace posts", err);
        if (isMounted)
          setError("Failed to load marketplace listings. Please check your connection and try again.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, [page, categoryFilter, statusFilter]);

  const filteredPosts = useMemo(() => {
    return posts.filter((p) => {
      const matchesSearch =
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
        p.author_id.toString().includes(searchTerm);
      const matchesCategory = categoryFilter === "ALL" || p.category === categoryFilter;
      const matchesStatus = statusFilter === "ALL" || p.status === statusFilter;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [posts, searchTerm, categoryFilter, statusFilter]);

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
      await postService.deletePost(id);
    } catch (err) {
      console.error("Failed to delete post", err);
      alert("Failed to delete post. It may have already been removed.");
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="p-6 md:p-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[#191c1e]">Marketplace</h2>
          <p className="text-[#3e4a3d] text-sm">
            {total} {total === 1 ? "listing" : "listings"} found
          </p>
        </div>
        <button
          onClick={() => {
            const load = async () => {
              setLoading(true);
              setError(null);
              try {
                const params: Record<string, string | number> = { page, limit };
                if (categoryFilter !== "ALL") params.category = categoryFilter;
                if (statusFilter !== "ALL") params.status = statusFilter;
                const response: PostsResponse = await postService.getAllPosts(params);
                const withPrice = response.data.filter((p) => p.price && p.price > 0);
                setPosts(withPrice);
                setTotal(withPrice.length);
              } catch (err) {
                console.error("Failed to fetch marketplace posts", err);
                setError("Failed to load marketplace listings. Please check your connection and try again.");
              } finally {
                setLoading(false);
              }
            };
            load();
          }}
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
            placeholder="Search by title, description, or author ID…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-9 pl-10 pr-3 rounded-lg border border-[#bdcaba] bg-white text-sm text-[#191c1e] placeholder-[#6e7b6c] focus:outline-none focus:ring-2 focus:ring-[#006b2c]/30"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(e.target.value);
            setPage(1);
          }}
          className="h-9 px-3 rounded-lg border border-[#bdcaba] bg-white text-sm text-[#191c1e] focus:outline-none focus:ring-2 focus:ring-[#006b2c]/30 appearance-none cursor-pointer"
        >
          {CATEGORY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
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
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="p-10 text-center text-[#6e7b6c]">
            {posts.length === 0 && !searchTerm && categoryFilter === "ALL" && statusFilter === "ALL"
              ? "No marketplace listings found."
              : "No listings match your filters."}
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#bdcaba] bg-[#f7f9fc] text-xs text-[#6e7b6c] uppercase tracking-wider">
                <th className="px-5 py-3 font-medium">Listing</th>
                <th className="px-5 py-3 font-medium">Category</th>
                <th className="px-5 py-3 font-medium">Price</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium hidden md:table-cell">Seller</th>
                <th className="px-5 py-3 font-medium text-right w-20">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-[#bdcaba]/50">
              {filteredPosts.map((post) => (
                <tr
                  key={post.id}
                  className="hover:bg-[#f2f4f7] transition-colors"
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      {post.images?.[0]?.url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={post.images[0].url}
                          alt={post.title}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-[#f2f4f7] flex items-center justify-center flex-shrink-0">
                          <ImageIcon className="w-5 h-5 text-[#6e7b6c]" />
                        </div>
                      )}
                      <div>
                        <div className="font-medium text-[#191c1e] line-clamp-1">
                          {post.title}
                        </div>
                        <div className="text-xs text-[#6e7b6c] line-clamp-1">
                          {post.description || "No description"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-[#3e4a3d]">
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold border bg-slate-50 text-slate-600 border-slate-200">
                      {CATEGORY_LABEL[post.category] || post.category}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-[#3e4a3d]">
                    {post.price ? `${post.price} DZD` : "—"}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded-full text-[11px] font-semibold border",
                        STATUS_BADGE[post.status] || STATUS_BADGE.DELETED
                      )}
                    >
                      {post.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-[#3e4a3d] hidden md:table-cell">
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-[#6e7b6c]" />
                      <span>User #{post.author_id}</span>
                    </div>
                  </td>
                  <td
                    className="px-5 py-3 text-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="relative inline-block">
                      <button
                        onClick={() =>
                          setActionMenu(actionMenu === post.id ? null : post.id)
                        }
                        className="p-1 text-[#6e7b6c] hover:text-[#191c1e] hover:bg-[#f2f4f7] rounded transition-colors"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>

                      {actionMenu === post.id && (
                        <div className="absolute right-0 z-20 mt-1 w-44 bg-white border border-[#bdcaba] rounded-lg shadow-lg py-1">
                          <button
                            onClick={() => {
                              setActionMenu(null);
                              router.push(`/citizen/${post.id}`);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-1.5 text-left text-sm hover:bg-[#f2f4f7] transition-colors text-[#191c1e]"
                          >
                            <Store className="w-4 h-4" />
                            View Listing
                          </button>
                          <button
                            onClick={() => {
                              setActionMenu(null);
                              handleDelete(post.id);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-1.5 text-left text-sm hover:bg-red-50 transition-colors text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                            Remove
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

      {totalPages > 1 && !loading && filteredPosts.length > 0 && (
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
