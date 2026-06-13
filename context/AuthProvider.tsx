"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { api } from "@/lib/api"; // Assuming this is an Axios instance

export interface User {
  userId: number | string;
  name: string;
  email?: string;
  role?: 
    | "Citizen" 
    | "Collector" 
    | "Recycling Centre" 
    | "Charity" 
    | "Admin" 
    | string;
}

export type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem("accessToken");
    
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      // Calls the /user endpoint mapped in your NestJS App
      const res = await api.get("/user", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setUser(res.data);
    } catch {
      // If the token is invalid or expired, clear the local state
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    // Hits the NestJS /auth/login endpoint
    const res = await api.post("/auth/login", { email, password });
    
    // Extract token object and user details from your auth.service.ts response format
    const { token, user: userData } = res.data;

    if (token?.accessToken) {
      localStorage.setItem("accessToken", token.accessToken);
      localStorage.setItem("refreshToken", token.refreshToken);
      setUser(userData); // Optimistic UI update
    }
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    
    if (refreshToken) {
      try {
        // Hits the NestJS /auth/logout endpoint to revoke the token in the database
        await api.post("/auth/logout", { refreshToken });
      } catch (error) {
        console.error("Logout request failed:", error);
      }
    }

    // Clear local state regardless of server response
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook helper
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};