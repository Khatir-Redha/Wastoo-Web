"use client";

import React, { useState } from "react";
import LinkNext from "next/link";
import {
  ArrowLeft,
  Recycle,
  Key,
  Eye,
  EyeOff,
  Loader2,
  Circle,
  CheckCircle2,
} from "lucide-react";
import Image from "next/image";
import  api  from "@/lib/api";
import { useParams, useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const router = useRouter();
  const params = useParams();
  
  // Extracts the [token] parameter from the URL path segment safely
  const token = typeof params?.token === "string" ? decodeURIComponent(params.token) : "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  // Password validation criteria checks
  const criteria = {
    hasLength: password.length >= 8,
    hasUpper: /[A-Z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[^A-Za-z0-9]/.test(password),
  };

  const metCount = Object.values(criteria).filter(Boolean).length;
  
  const getStrengthIndicator = () => {
    if (!password) return { text: "", color: "" };
    if (metCount <= 1) return { text: "Very weak", color: "text-red-500" };
    if (metCount <= 3) return { text: "Medium strength", color: "text-amber-500" };
    return { text: "Strong password", color: "text-green-600" };
  };

  const strength = getStrengthIndicator();
  const isPasswordValid = metCount === 4;

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError("");

  if (!token) {
    setError("Invalid or missing reset token. Please request a new recovery link.");
    return;
  }

  if (!isPasswordValid) {
    setError("Please ensure your password meets all requirements.");
    return;
  }

  if (password !== confirmPassword) {
    setError("Passwords do not match.");
    return;
  }

  setIsLoading(true);

  try {
    // Passes token as a query param, and the passwords in the body payload
    const response = await api.post(`/auth/resetPassword?token=${token}`, {
      password,
      confirmPassword,
    });

    setIsSuccess(true);
    setTimeout(() => {
      router.push("/login");
    }, 3000);
  } catch (err: any) {
    const backendMessage = err.response?.data?.message || err.message;
    setError(backendMessage || "A network error occurred. Please try again later.");
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row overflow-hidden font-sans">
      {/* Left Side: Brand Hero Panel */}
      <section className="relative flex-1 flex flex-col items-center justify-center p-8 md:p-12 min-h-[409px] md:min-h-screen text-white overflow-hidden bg-[#1A3C2E]">
        <div
          className="absolute inset-0 opacity-50 mix-blend-overlay pointer-events-none"
          style={{
            backgroundImage:
              'url("https://www.transparenttextures.com/patterns/carbon-fibre.png")',
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_2px_2px,rgba(255,255,255,0.04)_1px,transparent_0)] bg-[size:24px_24px]" />

        <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#16A34A] opacity-10 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#16A34A] opacity-10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        />

        <div className="text-center relative z-10 flex flex-col items-center">
          <div className="mb-8 inline-flex items-center justify-center w-28 h-28 bg-[#16A34A] rounded-[28px] shadow-2xl shadow-[#16A34A]/20">
            <Image
              src="/logo_white.svg"
              alt="Wasto Logo"
              width={50}
              height={50}
              className="w-16 h-16 object-contain"
            />
          </div>

          <h1 className="text-[44px] font-bold text-white tracking-tight leading-none mb-3">
            Wasto
          </h1>
          <p className="text-white/80 text-lg font-medium tracking-wide">
            Turn waste into value
          </p>
        </div>

        <div className="hidden md:block absolute bottom-12 left-12 right-12">
          <div className="p-4 bg-white/5 rounded-xl border border-white/10 backdrop-blur-md flex items-center justify-between">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full border-2 border-[#1A3C2E] bg-gray-300 overflow-hidden">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDgYEdh3gwoHD1szIECCnRGPNjvd8F1zd4DM2BlX3fcBEniU8AzN6WKAU2_o9snU5YF1HT6EojmgqCHNZJbc1x1qdOq_GlRsXXiP66hL_48jth3wH-9eDsjnNOwdIiZeFK9iV5Jz9FmNPll_8FS3MSdVyYHfygi4MDNvXYb8wREdmRjpu6qWQ0nWoQkDo4s2EhyGLjM5zgYgbzFlgGd0JnIDM9q6LwwoPFX2bWtcW_Bts33NF4YKz4Pb8BQEc420GE4OALBbPP1FE8"
                  alt="User 1"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="w-8 h-8 rounded-full border-2 border-[#1A3C2E] bg-gray-400 overflow-hidden">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBG7nKUJ2dLoe4w0dERG1QzOJFYZjamf6GXmTSiZTktXrOHQhi1NiOcZ6jJERbgPReXEyJbZWYWSZnnHYb1FjJCjubM_uuc7o5ok_drCzs-B6krzOFekHJwJqGYzSDKdTCwXEZa_cwA0PD6Jt3HH6-nVFK-r_D2sgnCFyX8urNjSyp1eK8qMsVX9JOSrz1lu9SUOHRpSn46j75yaESn9KKnZejo9bF74wNOHMBlJlQCTDDiM5EwIJTNsxr2DXjcpSJcjuZcK1txR5c"
                  alt="User 2"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="w-8 h-8 rounded-full border-2 border-[#1A3C2E] bg-[#16A34A] flex items-center justify-center text-[10px] font-bold text-white">
                +12k
              </div>
            </div>
            <p className="text-xs text-white/40 font-medium">
              Trusted by 12,000+ businesses
            </p>
          </div>
        </div>
      </section>

      {/* Right Side: Reset Password Form Panel */}
      <main className="w-full md:w-1/2 h-full min-h-screen bg-surface flex flex-col items-center justify-center p-8 relative">
        <div className="md:hidden absolute top-8 left-0 w-full flex flex-col items-center">
          <div className="flex items-center gap-2">
            <Recycle className="text-[#16A34A] w-8 h-8" />
            <span className="text-xl font-bold text-[#16A34A]">Wasto</span>
          </div>
        </div>

        <div className="w-full max-w-[400px] flex flex-col animate-in fade-in duration-500">
          {isSuccess ? (
            <div className="text-center space-y-4 py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-10 h-10 text-[#16A34A]" />
              </div>
              <h2 className="text-2xl font-semibold text-foreground">Password reset complete</h2>
              <p className="text-sm text-muted-foreground">
                Your password has been successfully shifted to your account. Redirecting you back to login...
              </p>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <div className="w-10 h-10 bg-primary/10 flex items-center justify-center rounded-xl mb-6">
                  <Key className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-2xl font-semibold text-foreground tracking-tight mb-1">
                  Set new password
                </h2>
                <p className="text-sm text-muted-foreground">
                  Your new password must be different from previous passwords.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Input 1: New Password */}
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium text-muted-foreground">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="w-full h-10 pl-4 pr-10 border border-border rounded-xl outline-none bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-foreground text-sm"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Password Evaluation Criteria Panel */}
                {password && (
                  <div className="space-y-2 animate-in fade-in duration-300">
                    <p className={`text-xs font-semibold ${strength.color}`}>
                      {strength.text}
                    </p>
                    <div className="p-4 bg-muted/30 border border-border rounded-xl space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        {criteria.hasLength ? (
                          <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                        ) : (
                          <Circle className="w-4 h-4 text-muted-foreground/40 shrink-0" />
                        )}
                        <span className={criteria.hasLength ? "text-foreground line-through opacity-60" : ""}>
                          At least 8 characters
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {criteria.hasUpper ? (
                          <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                        ) : (
                          <Circle className="w-4 h-4 text-muted-foreground/40 shrink-0" />
                        )}
                        <span className={criteria.hasUpper ? "text-foreground line-through opacity-60" : ""}>
                          One uppercase letter
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {criteria.hasNumber ? (
                          <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                        ) : (
                          <Circle className="w-4 h-4 text-muted-foreground/40 shrink-0" />
                        )}
                        <span className={criteria.hasNumber ? "text-foreground line-through opacity-60" : ""}>
                          One number
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {criteria.hasSpecial ? (
                          <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                        ) : (
                          <Circle className="w-4 h-4 text-muted-foreground/40 shrink-0" />
                        )}
                        <span className={criteria.hasSpecial ? "text-foreground line-through opacity-60" : ""}>
                          One special character
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Input 2: Confirm Password */}
                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="text-sm font-medium text-muted-foreground">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your password"
                      className="w-full h-10 pl-4 pr-10 border border-border rounded-xl outline-none bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-foreground text-sm"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <p className="text-red-500 text-xs font-medium mt-1 animate-in shake-1">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isLoading || !isPasswordValid || password !== confirmPassword}
                  className="w-full h-10 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-all flex items-center justify-center gap-2 mt-2"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Reset password"
                  )}
                </button>

                <div className="pt-2 text-center">
                  <LinkNext
                    href="/login"
                    className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-semibold text-sm mx-auto"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to sign in</span>
                  </LinkNext>
                </div>
              </form>
            </>
          )}
        </div>
      </main>
    </div>
  );
}