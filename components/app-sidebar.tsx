"use client" // Ensure this is marked as a client component to handle events and hooks

import * as React from "react"
import { useRouter } from "next/navigation" // For redirection after logout
import { useAuth } from "@/context/AuthProvider" // Adjust this path to wherever your useAuth hook or context lives
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

const navData = {
  overview: [
    { title: "Overview", url: "#", icon: LayoutDashboard, isActive: true },
  ],
  sections: [
    {
      title: "USERS",
      items: [
        { title: "All Users", url: "#", icon: Users },
        { title: "KYC Queue", url: "#", icon: ShieldCheck, badge: "28" },
        { title: "Charity Verification", url: "#", icon: HeartHandshake, badge: "4" },
        { title: "Roles", url: "#", icon: Shield },
      ],
    },
    {
      title: "CONTENT",
      items: [
        { title: "Waste Posts", url: "#", icon: FileText },
        { title: "Moderation Log", url: "#", icon: Gavel, badge: "6" },
      ],
    },
    {
      title: "OPERATIONS",
      items: [
        { title: "Pickups", url: "#", icon: Truck },
        { title: "Wallet", url: "#", icon: Wallet },
        { title: "Marketplace", url: "#", icon: Store },
      ],
    },
    {
      title: "CONFIGURATION",
      items: [
        { title: "Eco-Coin Rates", url: "#", icon: Leaf },
        { title: "CO2 Factors", url: "#", icon: Cloud },
        { title: "Notifications", url: "#", icon: Bell },
      ],
    },
    {
      title: "ANALYTICS",
      items: [
        { title: "Platform Analytics", url: "#", icon: BarChart2 },
        { title: "Impact", url: "#", icon: Activity },
        { title: "Reports", url: "#", icon: FileBarChart },
      ],
    },
    {
      title: "SYSTEM",
      items: [
        { title: "Audit Logs", url: "#", icon: ScrollText },
        { title: "Settings", url: "#", icon: Settings },
      ],
    },
  ],
}

export function AppSidebar() {
  const router = useRouter()
  const { logout } = useAuth() // Pulling the logout method from your Auth context

  const handleLogout = async () => {
    try {
      // 1. Call your auth context's logout function (which triggers the backend POST /auth/logout)
      await logout()
      
      // 2. Redirect back to the login screen
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
        {/* Overview (Active State) */}
        <SidebarGroup className="py-0 mb-2">
          <SidebarGroupContent>
            <SidebarMenu>
              {navData.overview.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={item.isActive}
                    className="h-8 py-1 data-[active=true]:bg-[#F0FDF4] data-[active=true]:text-[#006b2c] data-[active=true]:border-l-[3px] data-[active=true]:border-[#006b2c] rounded-r-lg rounded-l-none"
                  >
                    <a href={item.url} className="flex items-center gap-3">
                      <item.icon className="h-4 w-4" />
                      <span className="font-semibold">{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
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
                {section.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild className="h-8 py-1 px-3 text-[#3e4a3d] hover:bg-[#f2f4f7] rounded-lg transition-all">
                      <a href={item.url} className="flex items-center gap-3">
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                    {item.badge && (
                      <SidebarMenuBadge className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.5 rounded-full mr-2">
                        {item.badge}
                      </SidebarMenuBadge>
                    )}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      {/* Footer (Logout Integration) */}
      <SidebarFooter className="border-t border-[#bdcaba] p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            {/* Removed asChild so we can natively target the click event directly on the item button */}
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