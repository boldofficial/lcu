"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  CreditCard,
  Settings,
  FileText,
  BarChart3,
  Shield,
  Church,
  Inbox,
  PenLine,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { Profile } from "@/lib/types"

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/admissions", label: "Admissions", icon: Inbox },
  { href: "/admin/students", label: "Students", icon: Users },
  { href: "/admin/programs", label: "Programs", icon: GraduationCap },
  { href: "/admin/courses", label: "Courses", icon: BookOpen },
  { href: "/admin/faculty", label: "Faculty", icon: Shield },
  { href: "/admin/enrollments", label: "Enrollments", icon: FileText },
  { href: "/admin/payments", label: "Payments", icon: CreditCard },
  { href: "/admin/blog", label: "Blog", icon: PenLine },
  { href: "/admin/reports", label: "Reports", icon: BarChart3 },
  { href: "/admin/settings", label: "Settings", icon: Settings },
]

import Image from "next/image"

export function AdminSidebar({ profile }: { profile: Profile }) {
  const pathname = usePathname()

  return (
    <aside className="hidden w-64 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground lg:flex">
      <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 p-1">
          <Image
            src="/images/lcu-logo.png"
            alt="LCU Logo"
            width={40}
            height={40}
            className="h-full w-full object-contain"
          />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-sidebar-foreground">LCU Admin</span>
          <span className="text-xs text-sidebar-foreground/70">Portal</span>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3 rounded-lg bg-sidebar-accent/50 px-3 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sidebar-primary text-sidebar-primary-foreground text-sm font-medium">
            {profile.first_name?.[0]}
            {profile.last_name?.[0]}
          </div>
          <div className="flex flex-col text-sidebar-foreground">
            <span className="text-sm font-medium">
              {profile.first_name} {profile.last_name}
            </span>
            <span className="text-xs text-sidebar-foreground/70 capitalize">{profile.role}</span>
          </div>
        </div>
      </div>
    </aside>
  )
}
