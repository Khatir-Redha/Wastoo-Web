"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Bell } from "lucide-react"
import api from "@/lib/api"

export function NotificationBell() {
  const router = useRouter()
  const [unreadCount, setUnreadCount] = React.useState(0)

  const fetchUnreadCount = async () => {
    try {
      const response = await api.get('/notification/unread-count')
      setUnreadCount(Number(response.data) || 0)
    } catch (error) {
      console.error('Failed to fetch unread notifications count', error)
    }
  }

  React.useEffect(() => {
    // Fetch on mount
    fetchUnreadCount()

    // Fetch on window focus to match the "refresh-on-focus" pattern seen in the app
    const handleFocus = () => fetchUnreadCount()
    window.addEventListener('focus', handleFocus)

    // Optional: Also poll periodically to ensure sync if window stays focused
    const interval = setInterval(fetchUnreadCount, 30000)

    return () => {
      window.removeEventListener('focus', handleFocus)
      clearInterval(interval)
    }
  }, [])

  const displayCount = unreadCount > 9 ? "9+" : unreadCount.toString()

  return (
    <button
      onClick={() => router.push("/admin/notifications")}
      className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
      aria-label="Notifications"
    >
      <Bell className="h-5 w-5 text-[#3e4a3d]" />
      {unreadCount > 0 && (
        <span className="absolute top-0 right-0 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
          {displayCount}
        </span>
      )}
    </button>
  )
}
