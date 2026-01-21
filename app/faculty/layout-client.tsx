"use client"

import type { ReactNode } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import type { Profile } from "@/lib/types"

interface FacultyLayoutClientProps {
  children: ReactNode
  profile: Profile
}

export function FacultyLayoutClient({ children, profile }: FacultyLayoutClientProps) {
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  const userName = [profile.first_name, profile.last_name].filter(Boolean).join(" ") || "Faculty"

  return (
    <div className="flex h-screen bg-background">
      <DashboardSidebar role={profile.role} userName={userName} userEmail={profile.email} onSignOut={handleSignOut} />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
