"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";

export default function OAuthTestPage() {
  const [authStatus, setAuthStatus] = useState<string>("Checking authentication status...");
  const [userInfo, setUserInfo] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    // Check if session cookies/session are established
    api.get("/user")
      .then((res) => {
        setAuthStatus("Authenticated successfully via session cookies!");
        setUserInfo(res.data);
      })
      .catch((err) => {
        setAuthStatus("Not authenticated. Click below to test Google OAuth login.");
        if (err.response?.status !== 401) {
          setErrorMsg(err.message || "Failed to reach backend API.");
        }
      });
  }, []);

  const handleGoogleSignIn = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    // Navigate browser to backend Google OAuth endpoint (web flow, without state=mobile)
    window.location.href = `${apiUrl}/auth/google`;
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6 font-sans">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100 space-y-6">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800 font-medium text-center">
          ⚠️ Temporary Diagnostic & Testing Page
        </div>

        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">Google OAuth Web Test</h1>
          <p className="text-sm text-gray-600">
            Use this page to isolate and diagnose whether Google OAuth sign-in works correctly on the web backend flow.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-700 space-y-1">
          <p className="font-semibold text-gray-900">Status:</p>
          <p>{authStatus}</p>
          {userInfo && (
            <div className="mt-2 pt-2 border-t border-gray-200 text-xs text-gray-600 space-y-1">
              <p><span className="font-medium">User ID:</span> {userInfo.id}</p>
              <p><span className="font-medium">Name:</span> {userInfo.name}</p>
              <p><span className="font-medium">Email:</span> {userInfo.email}</p>
              <p><span className="font-medium">Role:</span> {userInfo.role}</p>
            </div>
          )}
          {errorMsg && (
            <p className="text-red-600 text-xs mt-2">{errorMsg}</p>
          )}
        </div>

        <div className="space-y-3">
          <Button
            onClick={handleGoogleSignIn}
            className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl flex items-center justify-center space-x-2 shadow-sm"
          >
            <span>Sign in with Google (Web Test)</span>
          </Button>

          <a
            href="/login"
            className="block text-center text-xs text-gray-500 hover:underline pt-2"
          >
            Return to regular login
          </a>
        </div>
      </div>
    </div>
  );
}
