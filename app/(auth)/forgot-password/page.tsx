"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Mail,
  Recycle,
  MailCheck,
  Info,
  ExternalLink,
  Loader2,
} from "lucide-react";
import Image from "next/image";
import api  from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(0);

  // Handle the countdown timer for the resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const validateEmail = (email: string) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      );
  };

  // Reusable API handler for sending/resending the link
  const sendResetEmail = async (targetEmail: string): Promise<boolean> => {
    setError("");
    setIsLoading(true);

    try {
      const response = await api.post(`/auth/forgetPassword`, {
        email: targetEmail,
      });

      const data = response.data;
      console.log(data);
      if (!response.data.success) {
        throw new Error(data.message || "Failed to process request. Please try again.");
      }

      return true;
    } catch (err: any) {
      setError(err.message || "A network error occurred. Please try again later.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    const success = await sendResetEmail(email);
    if (success) {
      setIsSubmitted(true);
      setCountdown(60); // Start 60 second cooldown
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || !email) return;
    
    const success = await sendResetEmail(email);
    if (success) {
      setCountdown(60);
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
          {/* Exact Logo Design */}
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

      {/* Right Side: Form Panel */}
      <main className="w-full md:w-1/2 h-full min-h-screen bg-surface flex flex-col items-center justify-center p-8 relative">
        {/* Mobile Logo Header */}
        <div className="md:hidden absolute top-8 left-0 w-full flex flex-col items-center">
          <div className="flex items-center gap-2">
            <Recycle className="text-[#16A34A] w-8 h-8" />
            <span className="text-xl font-bold text-[#16A34A]">
              Wasto
            </span>
          </div>
        </div>

        {/* View A: Email Entry Form */}
        {!isSubmitted ? (
          <div className="w-full max-w-[400px] flex flex-col animate-in fade-in duration-500">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-primary font-semibold decoration-2 underline-offset-4 hover:underline mb-12 w-fit"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Back to sign in</span>
            </Link>

            <div className="mb-8">
              <div className="w-10 h-10 bg-primary/10 flex items-center justify-center rounded-xl mb-6">
                <Mail className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-2xl font-semibold text-foreground tracking-tight mb-1">
                Forgot your password?
              </h2>
              <p className="text-sm text-muted-foreground">
                Enter your email address and we'll send you a link to reset your
                password.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-muted-foreground"
                >
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError("");
                    }}
                    placeholder="Enter your email"
                    className={`w-full h-10 pl-9 pr-4 border rounded-xl outline-none bg-background transition-all placeholder:text-muted-foreground text-foreground text-sm ${
                      error
                        ? "border-red-500 focus:ring-2 focus:ring-red-500/20"
                        : "border-border focus:border-primary focus:ring-2 focus:ring-primary/20"
                    }`}
                    required
                  />
                </div>
                {error && (
                  <p className="text-red-500 text-xs font-medium mt-1">
                    {error}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-10 bg-primary hover:bg-primary/90 disabled:opacity-70 text-white font-medium rounded-xl transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Send reset link"
                )}
              </button>
            </form>
          </div>
        ) : (
          /* View B: Success Message */
          <div className="w-full max-w-[400px] flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-500">
            <div className="w-20 h-20 bg-primary/10 flex items-center justify-center rounded-full mb-6 border-4 border-background shadow-sm">
              <div className="w-14 h-14 bg-primary flex items-center justify-center rounded-full">
                <MailCheck className="w-6 h-6 text-white" />
              </div>
            </div>

            <h2 className="text-2xl font-semibold text-foreground tracking-tight mb-1">
              Check your email
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              We've sent a password reset link to <br />
              <span className="font-semibold text-foreground">{email}</span>
            </p>

            <div className="w-full p-4 bg-primary/5 border border-primary/10 rounded-xl flex items-start gap-3 text-left mb-6">
              <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <p className="text-muted-foreground text-xs leading-relaxed">
                The reset link will expire in 1 hour. If you don't see it,
                please check your spam folder.
              </p>
            </div>

            <button
              type="button"
              onClick={() => window.open(`mailto:`)}
              className="w-full h-10 bg-primary hover:bg-primary/90 text-white font-medium rounded-xl transition-all flex items-center justify-center gap-2 mb-8"
            >
              Open email app
              <ExternalLink className="w-4 h-4" />
            </button>

            <div className="flex flex-col items-center gap-6">
              <div className="text-muted-foreground text-sm flex items-center gap-1">
                Didn't receive the email?{" "}
                {countdown === 0 ? (
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={isLoading}
                    className="text-primary font-semibold hover:underline disabled:opacity-50"
                  >
                    Click to resend
                  </button>
                ) : (
                  <span className="font-mono text-muted-foreground">
                    00:{countdown.toString().padStart(2, "0")}
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() => setIsSubmitted(false)}
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-semibold text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to sign in
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}