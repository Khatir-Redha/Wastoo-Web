"use client"

import * as React from "react"
import { useRouter, usePathname } from "next/navigation" 
import { useAuth } from "@/context/AuthProvider" 
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  HeartHandshake,
  Shield,
  FileText,
  Gavel,
  Truck,
  Wallet,
  Store,
  Leaf,
  Cloud,
  Bell,
  BarChart2,
  Activity,
  FileBarChart,
  ScrollText,
  Settings,
  LogOut,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

// Replaced '#' with actual routing structure
const navData = {
  overview: [
    { title: "Overview", url: "/admin", icon: LayoutDashboard },
  ],
  sections: [
    {
      title: "USERS",
      items: [
        { title: "All Users", url: "/admin/users", icon: Users },
        { title: "KYC Queue", url: "/admin/kyc", icon: ShieldCheck, badge: "28" },
        { title: "Charity Verification", url: "/admin/charities", icon: HeartHandshake, badge: "4" },
        { title: "Roles", url: "/admin/roles", icon: Shield },
      ],
    },
    {
      title: "CONTENT",
      items: [
        { title: "Waste Posts", url: "/admin/posts", icon: FileText },
        { title: "Moderation Log", url: "/admin/moderation", icon: Gavel, badge: "6" },
      ],
    },
    {
      title: "OPERATIONS",
      items: [
        { title: "Pickups", url: "/admin/pickups", icon: Truck },
        { title: "Wallet", url: "/admin/wallet", icon: Wallet },
        { title: "Marketplace", url: "/admin/marketplace", icon: Store },
      ],
    },
    {
      title: "CONFIGURATION",
      items: [
        { title: "Eco-Coin Rates", url: "/admin/rates", icon: Leaf },
        { title: "CO2 Factors", url: "/admin/co2", icon: Cloud },
        { title: "Notifications", url: "/admin/notifications", icon: Bell },
      ],
    },
    {
      title: "ANALYTICS",
      items: [
        { title: "Platform Analytics", url: "/admin/analytics", icon: BarChart2 },
        { title: "Impact", url: "/admin/impact", icon: Activity },
        { title: "Reports", url: "/admin/reports", icon: FileBarChart },
      ],
    },
    {
      title: "SYSTEM",
      items: [
        { title: "Audit Logs", url: "/admin/audit", icon: ScrollText },
        { title: "Settings", url: "/admin/settings", icon: Settings },
      ],
    },
  ],
}

export function AppSidebar() {
  const router = useRouter()
  const pathname = usePathname() // <-- Get current route
  const { logout } = useAuth()

  const handleLogout = async () => {
    try {
      await logout()
      router.push("/login")
    } catch (error) {
      console.error("Failed to log out cleanly:", error)
    }
  }

  return (
    <Sidebar className="border-r border-[#bdcaba] bg-[#ffffff] w-[240px]">
      {/* Header */}
      <SidebarHeader className="px-3 py-4 mb-2">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#006b2c] text-white font-bold shadow-sm">
            W
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-[#006b2c] tracking-tight text-base leading-none">
              Wasto Admin
            </span>
            <span className="text-[11px] text-[#3e4a3d] mt-1 leading-none">
              Management Portal
            </span>
          </div>
        </div>
      </SidebarHeader>

      {/* Main Content */}
      <SidebarContent className="gap-0 pr-2">
        {/* Overview */}
        <SidebarGroup className="py-0 mb-2">
          <SidebarGroupContent>
            <SidebarMenu>
              {navData.overview.map((item) => {
                const isActive = pathname === item.url
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      isActive={isActive}
                      onClick={() => router.push(item.url)}
                      className="h-8 py-1 data-[active=true]:bg-[#F0FDF4] data-[active=true]:text-[#006b2c] data-[active=true]:border-l-[3px] data-[active=true]:border-[#006b2c] data-[active=true]:font-semibold rounded-r-lg rounded-l-none text-[#3e4a3d] hover:bg-[#f2f4f7] transition-all flex items-center gap-3 cursor-pointer w-full justify-start pl-3"
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Dynamic Sections */}
        {navData.sections.map((section) => (
          <SidebarGroup key={section.title} className="py-1">
            <SidebarGroupLabel className="text-[10px] text-[#3e4a3d] uppercase tracking-wider h-5 px-3 mb-0.5">
              {section.title}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-0.5">
                {section.items.map((item) => {
                  const isActive = pathname === item.url // <-- Check active state
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        isActive={isActive}
                        onClick={() => router.push(item.url)}
                        // Applied unified active styling across all items
                        className="h-8 py-1 data-[active=true]:bg-[#F0FDF4] data-[active=true]:text-[#006b2c] data-[active=true]:border-l-[3px] data-[active=true]:border-[#006b2c] data-[active=true]:font-semibold rounded-r-lg rounded-l-none text-[#3e4a3d] hover:bg-[#f2f4f7] transition-all flex items-center gap-3 cursor-pointer w-full justify-start pl-3"
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                      {item.badge && (
                        <SidebarMenuBadge className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.5 rounded-full mr-2">
                          {item.badge}
                        </SidebarMenuBadge>
                      )}
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      {/* Footer (Logout Integration) */}
      <SidebarFooter className="border-t border-[#bdcaba] p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              onClick={handleLogout}
              className="h-8 py-1 px-3 text-[#3e4a3d] hover:bg-red-50 hover:text-red-600 rounded-lg w-full justify-start gap-3 transition-colors cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              <span className="font-medium">Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}