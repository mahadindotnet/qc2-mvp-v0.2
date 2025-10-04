"use client"

import * as React from "react"
import {
  Package,
  MessageSquare,
  DollarSign,
  TrendingUp,
  Settings,
  Home,
  Users,
  FileText,
  Download,
  Bell,
  RefreshCw,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

interface AdminSidebarProps {
  ordersCount: number
  quotesCount: number
  totalRevenue: number
  activeTab: string
  onTabChange: (tab: string) => void
  onRefresh: () => void
  onExport: () => void
  onExportAll: () => void
}

export function AdminSidebar({ 
  ordersCount, 
  quotesCount, 
  totalRevenue, 
  activeTab, 
  onTabChange, 
  onRefresh, 
  onExport, 
  onExportAll 
}: AdminSidebarProps) {
  const data = {
    user: {
      name: "Admin",
      email: "admin@quickcopy2.com",
      avatar: "/avatars/admin.jpg",
    },
    teams: [
      {
        name: "QuickCopy2",
        logo: Package,
        plan: "Business",
      },
    ],
    navMain: [
      {
        title: "Dashboard",
        url: "#",
        icon: Home,
        isActive: activeTab === 'dashboard',
        onClick: () => onTabChange('dashboard'),
      },
      {
        title: "Orders",
        url: "#",
        icon: Package,
        isActive: activeTab === 'orders',
        onClick: () => onTabChange('orders'),
        badge: ordersCount,
        items: [
          {
            title: "All Orders",
            url: "#",
            onClick: () => onTabChange('orders'),
          },
          {
            title: "Pending",
            url: "#",
            onClick: () => onTabChange('orders'),
          },
          {
            title: "Processing",
            url: "#",
            onClick: () => onTabChange('orders'),
          },
          {
            title: "Completed",
            url: "#",
            onClick: () => onTabChange('orders'),
          },
        ],
      },
      {
        title: "Quotes",
        url: "#",
        icon: MessageSquare,
        isActive: activeTab === 'quotes',
        onClick: () => onTabChange('quotes'),
        badge: quotesCount,
        items: [
          {
            title: "All Quotes",
            url: "#",
            onClick: () => onTabChange('quotes'),
          },
          {
            title: "Pending",
            url: "#",
            onClick: () => onTabChange('quotes'),
          },
          {
            title: "Approved",
            url: "#",
            onClick: () => onTabChange('quotes'),
          },
          {
            title: "Rejected",
            url: "#",
            onClick: () => onTabChange('quotes'),
          },
        ],
      },
      {
        title: "Analytics",
        url: "#",
        icon: TrendingUp,
        isActive: activeTab === 'analytics',
        onClick: () => onTabChange('analytics'),
        items: [
          {
            title: "Revenue",
            url: "#",
            onClick: () => onTabChange('analytics'),
          },
          {
            title: "Orders",
            url: "#",
            onClick: () => onTabChange('analytics'),
          },
          {
            title: "Customers",
            url: "#",
            onClick: () => onTabChange('analytics'),
          },
        ],
      },
      {
        title: "Settings",
        url: "#",
        icon: Settings,
        isActive: activeTab === 'settings',
        onClick: () => onTabChange('settings'),
        items: [
          {
            title: "General",
            url: "#",
            onClick: () => onTabChange('settings'),
          },
          {
            title: "Notifications",
            url: "#",
            onClick: () => onTabChange('settings'),
          },
          {
            title: "Users",
            url: "#",
            onClick: () => onTabChange('settings'),
          },
        ],
      },
    ],
    projects: [
      {
        name: "Export Orders",
        url: "#",
        icon: Download,
        onClick: onExport,
      },
      {
        name: "Export All",
        url: "#",
        icon: FileText,
        onClick: onExportAll,
      },
      {
        name: "Refresh Data",
        url: "#",
        icon: RefreshCw,
        onClick: onRefresh,
      },
    ],
  }

  return (
    <Sidebar collapsible="icon" className="border-r border-gray-200">
      <SidebarHeader className="border-b border-gray-200">
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent className="bg-white">
        <NavMain items={data.navMain} />
        <div className="px-3 py-2">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
            Quick Actions
          </div>
          <div className="space-y-1">
            {data.projects.map((project) => (
              <button
                key={project.name}
                onClick={project.onClick}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-700 rounded-md transition-colors"
              >
                <project.icon className="h-4 w-4" />
                <span>{project.name}</span>
              </button>
            ))}
          </div>
        </div>
        
        {/* Stats Section */}
        <div className="px-3 py-4 border-t border-gray-200">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
            Overview
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Orders</span>
              <span className="text-sm font-semibold text-orange-600">{ordersCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Quotes</span>
              <span className="text-sm font-semibold text-blue-600">{quotesCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Revenue</span>
              <span className="text-sm font-semibold text-green-600">${totalRevenue.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </SidebarContent>
      <SidebarFooter className="border-t border-gray-200">
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
