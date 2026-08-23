"use client";

import { createContext, useContext, useEffect, useState } from "react";
import api from "@/lib/api";

// 1. Updated interface to match your exact backend response
export interface User {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  status: string;
  role: string;
  photo: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  provider: string | null;
  providerId: string | null;
}

export type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const setCookie = (name: string, value: string, days = 7) => {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Lax`;
};

const deleteCookie = (name: string) => {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    hydrateAuthSession();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get("/user");
      setUser(res.data);
      return res.data;
    } catch (error) {
      console.error("Failed to fetch authoritative user profile:", error);
      cleanupAuth();
      throw error;
    }
  };
  const hydrateAuthSession = async () => {
    setLoading(true);
    try {
      const savedToken = localStorage.getItem("access_token");

      if (savedToken) {
        // If we have a token, ask the backend who this user is
        await fetchProfile();
      } else {
        cleanupAuth();
      }
    } catch (error) {
      // Error handled inside fetchProfile
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const res = await api.post("/auth/login", { email, password });

      const accessToken = res.data?.token?.accessToken || res.data?.accessToken;
      const refreshToken =
        res.data?.token?.refreshToken || res.data?.refreshToken;

      if (accessToken) {
        setCookie("access_token", accessToken, 1);
        if (refreshToken) setCookie("refresh_token", refreshToken, 7);
        localStorage.setItem("access_token", accessToken);

        // Fetch profile using the session cookie set by the backend
        await fetchProfile();
      }
    } catch (error) {
      console.error("Login execution failed:", error);
      throw error;
    }
  };

  const cleanupAuth = () => {
    deleteCookie("access_token");
    deleteCookie("refresh_token");
    localStorage.removeItem("access_token");
    setUser(null);
  };

  const logout = async () => {
    cleanupAuth();
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
