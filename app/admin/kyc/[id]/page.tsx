"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Ban,
  CheckCircle,
  XCircle,
  Clock,
  User as UserIcon,
  FileText,
  FileText as FileIcon,
  Send,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "@/context/AuthProvider";
import kycService, {
  KycApplicationDetail,
  KycDocumentFile,
  KycStatus,
  DocumentKind,
} from "@/services/kycService";
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

const DOC_KIND_LABEL: Record<DocumentKind, string> = {
  ID: "National ID",
  SELFIE: "Selfie with ID",
  SUPPORTING: "Supporting Document",
};

function isImage(url: string): boolean {
  return /\.(jpg|jpeg|png|gif|webp|bmp|svg)(\?.*)?$/i.test(url);
}

function isPdf(url: string): boolean {
  return /\.pdf(\?.*)?$/i.test(url);
}

function DocumentPreview({ doc }: { doc: KycDocumentFile }) {
  const url = doc.url;

  return (
    <div className="border border-[#bdcaba] rounded-lg p-3 bg-[#fafbfc]">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-[#3e4a3d]">
          {DOC_KIND_LABEL[doc.type] ?? doc.type}
        </span>
        <span className="text-[10px] text-[#6e7b6c]">
          {new Date(doc.uploaded_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
        </span>
      </div>

      {isImage(url) ? (
        <div className="bg-[#e9ecef] rounded-md overflow-hidden flex items-center justify-center min-h-[120px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt={DOC_KIND_LABEL[doc.type] ?? "KYC document"}
            className="max-w-full max-h-[200px] object-contain"
          />
        </div>
      ) : isPdf(url) ? (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center min-h-[120px] border-2 border-dashed border-[#bdcaba] rounded-md bg-[#f9f9f9] hover:bg-[#f2f4f7] transition-colors"
        >
          <FileIcon className="w-8 h-8 text-[#6e7b6c] mb-2" />
          <span className="text-xs text-[#3e4a3d] font-medium">
            View PDF
          </span>
        </a>
      ) : (
        <div className="flex flex-col items-center justify-center min-h-[120px] border-2 border-dashed border-[#bdcaba] rounded-md bg-[#f9f9f9]">
          <FileText className="w-8 h-8 text-[#6e7b6c] mb-2" />
          <span className="text-xs text-[#3e4a3d] font-medium">
            View Document
          </span>
        </div>
      )}
    </div>
  );
}

export default function KycReviewPage() {
  const router = useRouter();
  const params = useParams();
  const { user: authUser, loading: authLoading } = useAuth();

  const id = params?.id ? Number(params.id) : null;

  const [application, setApplication] = useState<KycApplicationDetail | null>(
    null
  );
  const [userName, setUserName] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);

  const isAdminGatePassed =
    !authLoading && (!!authUser && authUser.role === "ADMIN");

  const fetchApplication = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setActionError(null);
    try {
      const data = await kycService.getKycApplication(id);

      if (data.user_name) {
        setApplication(data);
      } else {
        try {
          const { users: allUsers } = await userService.getAllUsers();
          const userInfo = allUsers.find((u) => u.id === data.user_id);
          setUserName(userInfo ?? null);
        } catch (enrichError) {
          console.error("Failed to fetch user info", enrichError);
        }
        setApplication(data);
      }
    } catch (error) {
      console.error("Failed to fetch KYC application", error);
      setActionError("Failed to load application. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      if (id) {
        try {
          await fetchApplication();
        } catch (err) {
          if (isMounted) console.error(err);
        }
      }
    };

    load();
    return () => {
      isMounted = false;
    };
  }, [fetchApplication, id]);

  const allDocuments = useMemo(() => {
    if (!application) return [];

    const docs: KycDocumentFile[] = [];

    if (application.documents && application.documents.length > 0) {
      docs.push(...application.documents);
    }

    if (application.document_url) {
      docs.push({
        id: -1,
        type: "ID" as DocumentKind,
        url: application.document_url,
        uploaded_at: application.created_at,
      });
    }

    return docs;
  }, [application]);

  if (authLoading) {
    return (
      <div className="p-6 md:p-8">
        <div className="space-y-4">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-8 w-32" />
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

  if (!id) {
    return (
      <div className="p-6 md:p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
          Invalid application ID.
        </div>
      </div>
    );
  }

  const handleApprove = async () => {
    if (!application || application.status !== "PENDING") return;
    setActionLoading(true);
    setActionError(null);
    try {
      await kycService.approveKyc(application.id);
      router.push("/admin/kyc");
    } catch (error: unknown) {
      const status =
        error !== null &&
        typeof error === "object" &&
        "response" in error
          ? (error as { response?: { status?: number } }).response?.status
          : undefined;

      if (status === 409) {
        setActionError(
          "This application was already reviewed by another admin. Refreshing…"
        );
        await fetchApplication();
      } else if (status === 400) {
        setActionError(
          "This application could not be approved. It may have already been processed. Please refresh and try again."
        );
        await fetchApplication();
      } else {
        setActionError(
          "Failed to approve application. Please try again."
        );
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!application || application.status !== "PENDING") return;
    if (!rejectReason.trim()) {
      setActionError("A rejection reason is required.");
      return;
    }

    setActionLoading(true);
    setActionError(null);
    try {
      await kycService.rejectKyc(application.id, rejectReason.trim());
      router.push("/admin/kyc");
    } catch (error: unknown) {
      const status =
        error !== null &&
        typeof error === "object" &&
        "response" in error
          ? (error as { response?: { status?: number } }).response?.status
          : undefined;

      if (status === 409) {
        setActionError(
          "This application was already reviewed by another admin. Refreshing…"
        );
        await fetchApplication();
      } else if (status === 400) {
        setActionError(
          "This application could not be rejected. It may have already been processed. Please refresh and try again."
        );
        await fetchApplication();
      } else {
        setActionError(
          "Failed to reject application. Please try again."
        );
      }
    } finally {
      setActionLoading(false);
    }
  };

  const displayUserName =
    application?.user_name ?? userName?.name ?? `User #${id}`;
  const displayUserPhone =
    application?.user_phone ?? userName?.phone ?? null;
  const displayUserEmail =
    application?.user_email ?? userName?.email ?? null;

  const isPending = application?.status === "PENDING";

  return (
    <div className="p-6 md:p-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.push("/admin/kyc")}
          className="w-9 h-9 flex items-center justify-center rounded-lg border border-[#bdcaba] bg-white text-[#3e4a3d] hover:bg-[#f2f4f7] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h2 className="text-2xl font-bold text-[#191c1e]">KYC Review</h2>
      </div>

      {actionError && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {actionError}
        </div>
      )}

      {loading ? (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-[#bdcaba] p-6">
            <Skeleton className="h-6 w-24 mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-48 mb-4" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      ) : !application ? (
        <div className="bg-white rounded-xl border border-[#bdcaba] p-8 text-center">
          <FileText className="w-12 h-12 text-[#6e7b6c]/30 mx-auto mb-4" />
          <p className="text-[#6e7b6c]">
            No application found with ID #{id}.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-xl border border-[#bdcaba] p-6">
                <h3 className="text-base font-semibold text-[#191c1e] mb-4">
                  Submitted Documents
                </h3>

                {allDocuments.length === 0 ? (
                  <div className="text-center py-8 text-[#6e7b6c]">
                    <FileText className="w-8 h-8 text-[#6e7b6c]/30 mx-auto mb-2" />
                    <p>No documents were uploaded.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {allDocuments.map((doc) => (
                      <DocumentPreview key={doc.id} doc={doc} />
                    ))}
                  </div>
                )}

                {application.review_comment && (
                  <div className="mt-6 pt-4 border-t border-[#bdcaba]">
                    <span className="text-xs text-[#6e7b6c] uppercase tracking-wider">
                      Review Comment
                    </span>
                    <p className="mt-1 text-sm text-[#191c1e]">
                      {application.review_comment}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-[#bdcaba] p-6">
                <h3 className="text-base font-semibold text-[#191c1e] mb-4">
                  Collector Information
                </h3>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-[#006b2c]/10 flex items-center justify-center">
                    <UserIcon className="w-5 h-5 text-[#006b2c]" />
                  </div>
                  <div>
                    <p className="font-medium text-[#191c1e]">
                      {displayUserName}
                    </p>
                    {displayUserEmail && (
                      <p className="text-xs text-[#6e7b6c]">
                        {displayUserEmail}
                      </p>
                    )}
                    {displayUserPhone && (
                      <p className="text-xs text-[#6e7b6c]">
                        {displayUserPhone}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-4 text-xs text-[#6e7b6c]">
                  <Clock className="w-3 h-3" />
                  <span>
                    Submitted{" "}
                    {new Date(application.created_at).toLocaleDateString(
                      "en-US",
                      {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )}
                  </span>
                </div>

                <div>
                  <span className="text-xs text-[#6e7b6c] uppercase tracking-wider">
                    Document Type
                  </span>
                  <p className="mt-1 text-sm font-medium text-[#191c1e]">
                    {DOC_TYPE_LABEL[application.document_type] ??
                      application.document_type}
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-[#bdcaba] p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-semibold text-[#191c1e]">
                    Status
                  </h3>
                  <span
                    className={cn(
                      "px-2.5 py-1 rounded-full text-[11px] font-semibold border",
                      STATUS_BADGE[application.status]
                    )}
                  >
                    {application.status}
                  </span>
                </div>

                {!isPending ? (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>
                      This application is no longer pending. It may have been
                      reviewed by another administrator.
                    </span>
                  </div>
                ) : (
                  <>
                    {showRejectForm && (
                      <div className="mb-4">
                        <label className="block text-xs text-[#6e7b6c] uppercase tracking-wider mb-1">
                          Rejection Reason <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          placeholder="Explain why this application is being rejected…"
                          rows={3}
                          className="w-full px-3 py-2 rounded-lg border border-[#bdcaba] bg-white text-sm text-[#191c1e] placeholder-[#6e7b6c] focus:outline-none focus:ring-2 focus:ring-[#006b2c]/30 resize-none"
                        />
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => setShowRejectForm(false)}
                            className="flex-1 h-8 px-3 bg-white border border-[#bdcaba] rounded-lg text-sm font-medium text-[#3e4a3d] hover:bg-[#f2f4f7] transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleReject}
                            disabled={actionLoading || !rejectReason.trim()}
                            className="flex-1 h-8 px-3 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-1"
                          >
                            {actionLoading ? (
                              <RefreshCw className="w-3 h-3 animate-spin" />
                            ) : (
                              <Send className="w-3 h-3" />
                            )}
                            Submit Rejection
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-3">
                      <button
                        onClick={handleApprove}
                        disabled={actionLoading}
                        className="flex-1 h-9 px-3 bg-[#006b2c] text-white rounded-lg text-sm font-medium hover:bg-[#005320] disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                      >
                        {actionLoading ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <CheckCircle className="w-4 h-4" />
                        )}
                        Approve Application
                      </button>

                      <button
                        onClick={() => {
                          setShowRejectForm(true);
                          setRejectReason("");
                        }}
                        disabled={actionLoading}
                        className="flex-1 h-9 px-3 bg-white border border-[#bdcaba] text-[#191c1e] rounded-lg text-sm font-medium hover:bg-[#f2f4f7] transition-colors flex items-center justify-center gap-2"
                      >
                        <XCircle className="w-4 h-4 text-red-600" />
                        Reject
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
