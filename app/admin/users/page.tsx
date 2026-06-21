"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Download,
  UserPlus,
  MoreHorizontal,
  Filter,
  Archive,
  Trash2,
} from "lucide-react";
import { userService, User } from "@/services/usersService";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch Users on Load
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await userService.getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error("Failed to fetch users", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 2. Action Handlers
  const handleArchive = async (id: number) => {
    await userService.archiveUser(id);
    fetchUsers(); // Refresh list
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure? This action cannot be undone.")) {
      await userService.deleteUser(id);
      fetchUsers(); // Refresh list
    }
  };

  return (
    <div className="p-6 md:p-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[#191c1e]">User Management</h2>
          <p className="text-[#3e4a3d] text-sm">
            Manage, filter, and verify platform users.
          </p>
        </div>
        <button className="h-9 px-4 bg-[#006b2c] text-white rounded-lg text-sm font-medium hover:bg-[#005320] flex items-center gap-2">
          <UserPlus className="w-4 h-4" /> Invite User
        </button>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-xl border border-[#bdcaba] shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-[#6e7b6c]">
            Loading users...
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#bdcaba] bg-[#f7f9fc] text-xs text-[#6e7b6c] uppercase">
                <th className="px-5 py-3">User</th>
                <th className="px-5 py-3">Role</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-[#bdcaba]/50">
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-[#f2f4f7] transition-colors"
                >
                  <td className="px-5 py-3">
                    <div className="font-medium text-[#191c1e]">
                      {user.name}
                    </div>
                    <div className="text-xs text-[#6e7b6c]">{user.email}</div>
                  </td>
                  <td className="px-5 py-3 text-[#3e4a3d]">{user.role}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                        user.status === "ACTIVE"
                          ? "bg-[#F0FDF4] text-[#006b2c] border-[#006b2c]/20"
                          : "bg-red-50 text-red-700 border-red-200"
                      }`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right flex justify-end gap-2">
                    <button
                      onClick={() => handleArchive(user.id)}
                      className="p-1.5 text-[#6e7b6c] hover:text-amber-600 hover:bg-amber-50 rounded transition-colors"
                      title="Archive User"
                    >
                      <Archive className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="p-1.5 text-[#6e7b6c] hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Delete User"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
