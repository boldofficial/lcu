"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  Cross,
  LayoutDashboard,
  BookOpen,
  GraduationCap,
  CreditCard,
  Calendar,
  MessageSquare,
  Settings,
  Users,
  FileText,
  BarChart3,
  Bell,
  ClipboardList,
  UserCog,
  LogOut,
  Church,
} from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import type { UserRole } from "@/lib/types"

interface SidebarProps {
  role: UserRole
  userName: string
  userEmail: string
  onSignOut: () => void
}

export function DashboardSidebar({ role, userName, userEmail, onSignOut }: SidebarProps) {
  const pathname = usePathname()

  const getNavItems = () => {
    const baseItems = [
      {
        title: "Dashboard",
        href: role === "student" ? "/dashboard" : `/${role}`,
        icon: LayoutDashboard,
      },
    ]

    switch (role) {
      case "admin":
        return [
          ...baseItems,
          { title: "Users", href: "/admin/users", icon: Users },
          { title: "Programs", href: "/admin/programs", icon: GraduationCap },
          { title: "Courses", href: "/admin/courses", icon: BookOpen },
          { title: "Enrollments", href: "/admin/enrollments", icon: ClipboardList },
          { title: "Payments", href: "/admin/payments", icon: CreditCard },
          { title: "Reports", href: "/admin/reports", icon: BarChart3 },
          { title: "Announcements", href: "/admin/announcements", icon: Bell },
          { title: "Settings", href: "/admin/settings", icon: Settings },
        ]
      case "faculty":
        return [
          ...baseItems,
          { title: "My Courses", href: "/faculty/courses", icon: BookOpen },
          { title: "Students", href: "/faculty/students", icon: Users },
          { title: "Assessments", href: "/faculty/assessments", icon: FileText },
          { title: "Gradebook", href: "/faculty/gradebook", icon: ClipboardList },
          { title: "Discussions", href: "/faculty/discussions", icon: MessageSquare },
          { title: "Calendar", href: "/faculty/calendar", icon: Calendar },
        ]
      case "registrar":
        return [
          ...baseItems,
          { title: "Students", href: "/registrar/students", icon: Users },
          { title: "Enrollments", href: "/registrar/enrollments", icon: ClipboardList },
          { title: "Programs", href: "/registrar/programs", icon: GraduationCap },
          { title: "Transcripts", href: "/registrar/transcripts", icon: FileText },
          { title: "Payments", href: "/registrar/payments", icon: CreditCard },
          { title: "Reports", href: "/registrar/reports", icon: BarChart3 },
        ]
      default: // student
        return [
          ...baseItems,
          { title: "My Courses", href: "/dashboard/courses", icon: BookOpen },
          { title: "Grades", href: "/dashboard/grades", icon: ClipboardList },
          { title: "Payments", href: "/dashboard/payments", icon: CreditCard },
          { title: "Chapel", href: "/dashboard/chapel", icon: Church },
          { title: "Calendar", href: "/dashboard/calendar", icon: Calendar },
          { title: "Discussions", href: "/dashboard/discussions", icon: MessageSquare },
          { title: "Profile", href: "/dashboard/profile", icon: UserCog },
        ]
    }
  }

  const navItems = getNavItems()

  return (
    <div className="flex h-screen w-64 flex-col bg-sidebar text-sidebar-foreground">
      {/* Logo */}
      <div className="flex h-40 flex-col items-center justify-center border-b border-sidebar-border px-4 py-8">
        <Link href="/" className="relative h-28 w-full mb-4">
          <Image
            src="/images/lcu-white-logo.png"
            alt="Landmark Christian University"
            fill
            className="object-contain"
            priority
          />
        </Link>
        <span className="w-full text-center text-[10px] uppercase tracking-[0.2em] text-sidebar-foreground/40 font-bold">
          {role} Dashboard
        </span>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  pathname === item.href && "bg-sidebar-accent text-sidebar-accent-foreground",
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.title}
              </Button>
            </Link>
          ))}
        </nav>
      </ScrollArea>

      {/* User Info & Sign Out */}
      <div className="border-t border-sidebar-border p-4">
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sidebar-accent text-sm font-medium text-sidebar-accent-foreground">
            {userName
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-sm font-medium">{userName}</p>
            <p className="truncate text-xs text-sidebar-foreground/70">{userEmail}</p>
          </div>
        </div>
        <Separator className="my-3 bg-sidebar-border" />
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          onClick={onSignOut}
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  )
}
