"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Send,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  X,
} from "lucide-react";
import { useAuth } from "@/context/AuthProvider";
import { notificationService } from "@/services/notificationService";
import { userService } from "@/services/usersService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const KNOWN_ROUTES = [
  "/admin",
  "/admin/users",
  "/admin/kyc",
  "/admin/charities",
  "/admin/roles",
  "/admin/posts",
  "/admin/moderation",
  "/admin/pickups",
  "/admin/wallet",
  "/admin/marketplace",
  "/admin/rates",
  "/admin/co2",
  "/admin/notifications",
  "/admin/analytics",
  "/admin/impact",
  "/admin/reports",
  "/admin/audit",
  "/admin/settings",
];

export default function BroadcastPage() {
  const router = useRouter();
  const { user: authUser, loading: authLoading } = useAuth();

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [actionUrl, setActionUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [userCount, setUserCount] = useState<number | null>(null);
  const [loadingCount, setLoadingCount] = useState(true);

  const isAdminGatePassed = !authLoading && !!authUser && authUser.role === "ADMIN";

  useEffect(() => {
    let isMounted = true;
    const loadCount = async () => {
      try {
        const data = await userService.getAllUsers();
        if (isMounted) {
          const total =
            data.roleCounts?.reduce(
              (sum, r) => sum + (r._count?.role || 0),
              0
            ) || data.users?.length || 0;
          setUserCount(total);
        }
      } catch {
        if (isMounted) setUserCount(null);
      } finally {
        if (isMounted) setLoadingCount(false);
      }
    };
    loadCount();
    return () => {
      isMounted = false;
    };
  }, []);

  const validate = useCallback(() => {
    const errors: Record<string, string> = {};
    if (!title.trim()) errors.title = "Title is required.";
    if (title.length > 100)
      errors.title = "Title must be 100 characters or fewer.";
    if (!body.trim()) errors.body = "Body is required.";
    if (body.length > 500)
      errors.body = "Body must be 500 characters or fewer.";
    if (actionUrl && !KNOWN_ROUTES.includes(actionUrl)) {
      errors.actionUrl =
        "Action URL must be a valid in-app route (e.g. /admin/kyc).";
    }
    return errors;
  }, [title, body, actionUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      return;
    }

    setShowConfirm(true);
  };

  const confirmSend = async () => {
    setShowConfirm(false);
    setSubmitting(true);
    setError(null);

    try {
      await notificationService.broadcast({
        title: title.trim(),
        body: body.trim(),
        ...(actionUrl ? { actionUrl: actionUrl.trim() } : {}),
      });
      setSuccess(true);
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 422) {
        const apiErrors: Record<string, string> = {};
        const fields = err?.response?.data?.errors || err?.response?.data?.fieldErrors;
        if (fields && typeof fields === "object") {
          Object.entries(fields).forEach(([key, msg]) => {
            apiErrors[key] = String(msg);
          });
        }
        if (Object.keys(apiErrors).length === 0) {
          apiErrors._global =
            err?.response?.data?.message || "Invalid payload.";
        }
        setFieldErrors(apiErrors);
      } else if (status && status >= 500) {
        setError(
          "Notification service is temporarily unavailable. Please retry — your message has been preserved."
        );
      } else {
        setError(
          err?.response?.data?.message || "Failed to send broadcast. Please try again."
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

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

  if (success) {
    return (
      <div className="p-6 md:p-8 animate-in fade-in duration-500">
        <div className="max-w-2xl mx-auto text-center py-16">
          <div className="w-16 h-16 mx-auto bg-[#F0FDF4] rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="w-8 h-8 text-[#006b2c]" />
          </div>
          <h2 className="text-2xl font-bold text-[#191c1e] mb-2">
            Broadcast queued
          </h2>
          <p className="text-[#3e4a3d] text-sm mb-8">
            Your announcement has been queued for delivery. It may take a few
            minutes to reach all users.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setSuccess(false);
                setTitle("");
                setBody("");
                setActionUrl("");
                setFieldErrors({});
                setError(null);
              }}
            >
              Send another
            </Button>
            <Button onClick={() => router.push("/admin/notifications")}>
              Back to Notifications
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 animate-in fade-in duration-500">
      <div className="max-w-2xl">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-[#191c1e]">
            Broadcast Announcement
          </h2>
          <p className="text-[#3e4a3d] text-sm mt-1">
            Send a platform-wide notification to all users.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium">Service unavailable</p>
              <p className="mt-1">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-xl border border-[#bdcaba] shadow-sm p-6 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="title">
                Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                placeholder="e.g. Scheduled maintenance tonight"
                maxLength={100}
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (fieldErrors.title)
                    setFieldErrors((prev) => {
                      const next = { ...prev };
                      delete next.title;
                      return next;
                    });
                }}
                className={cn(
                  fieldErrors.title && "border-red-300 focus-visible:border-red-400"
                )}
              />
              <div className="flex items-center justify-between">
                <span className="text-xs text-red-600">{fieldErrors.title}</span>
                <span
                  className={cn(
                    "text-xs tabular-nums",
                    title.length > 100 ? "text-red-600" : "text-[#6e7b6c]"
                  )}
                >
                  {title.length}/100
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="body">
                Body <span className="text-red-500">*</span>
              </Label>
              <textarea
                id="body"
                placeholder="Write your announcement here..."
                maxLength={500}
                rows={5}
                value={body}
                onChange={(e) => {
                  setBody(e.target.value);
                  if (fieldErrors.body)
                    setFieldErrors((prev) => {
                      const next = { ...prev };
                      delete next.body;
                      return next;
                    });
                }}
                className={cn(
                  "w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-base transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 resize-y",
                  fieldErrors.body && "border-red-300 focus-visible:border-red-400"
                )}
              />
              <div className="flex items-center justify-between">
                <span className="text-xs text-red-600">{fieldErrors.body}</span>
                <span
                  className={cn(
                    "text-xs tabular-nums",
                    body.length > 500 ? "text-red-600" : "text-[#6e7b6c]"
                  )}
                >
                  {body.length}/500
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="actionUrl">Action URL (optional)</Label>
              <Input
                id="actionUrl"
                placeholder="/admin/kyc"
                value={actionUrl}
                onChange={(e) => {
                  setActionUrl(e.target.value);
                  if (fieldErrors.actionUrl)
                    setFieldErrors((prev) => {
                      const next = { ...prev };
                      delete next.actionUrl;
                      return next;
                    });
                }}
                className={cn(
                  fieldErrors.actionUrl &&
                    "border-red-300 focus-visible:border-red-400"
                )}
              />
              <p className="text-xs text-[#6e7b6c]">
                Must be a valid in-app route. Leave blank to keep users on the
                notification centre.
              </p>
              {fieldErrors.actionUrl && (
                <p className="text-xs text-red-600">{fieldErrors.actionUrl}</p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/admin/notifications")}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="bg-[#006b2c] hover:bg-[#005320]"
            >
              {submitting ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  <span>Sending...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Send className="w-4 h-4" />
                  <span>Send Broadcast</span>
                </div>
              )}
            </Button>
          </div>
        </form>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowConfirm(false)}
          />
          <div className="relative bg-white rounded-xl border border-[#bdcaba] shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-[#191c1e] mb-2">
              Confirm broadcast
            </h3>
            <p className="text-sm text-[#3e4a3d] mb-6">
              {loadingCount
                ? "This will notify all users on the platform — send anyway?"
                : userCount !== null
                  ? `This will notify all ${userCount.toLocaleString()} users — send anyway?`
                  : "This will notify all users on the platform — send anyway?"}
            </p>
            <div className="flex items-center justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowConfirm(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                onClick={confirmSend}
                disabled={submitting}
                className="bg-[#006b2c] hover:bg-[#005320]"
              >
                {submitting ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    <span>Sending...</span>
                  </div>
                ) : (
                  "Send"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
