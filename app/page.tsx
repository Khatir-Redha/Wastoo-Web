// app/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthProvider";

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        // Formats routes cleanly into lowercase slugs (e.g., /admin or /citizen)
        // If your Next.js directory folders use literal uppercase names, change to: user.role
        const targetRoute = user.role ? `/${user.role.toLowerCase()}` : "/citizen";
        router.replace(targetRoute);
      } else {
        // Redirection target if user visits root while logged out
        router.replace("/login"); 
      }
    }
  }, [user, loading, router]);

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-gray-50 text-gray-500">
      <div className="text-center space-y-2">
        {/* Simple clean modern loading UI matching an eco/dashboard theme */}
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent mx-auto"></div>
        <p className="text-sm font-medium tracking-wide animate-pulse">
          Routing to secure workspace...
        </p>
      </div>
    </div>
  );
}