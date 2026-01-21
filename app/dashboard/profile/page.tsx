import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/header"
import { ProfileForm } from "@/components/profile/profile-form"

export default async function ProfilePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  const { data: enrollment } = await supabase
    .from("enrollments")
    .select(`
      *,
      program:programs(name, code, degree_type)
    `)
    .eq("student_id", user.id)
    .eq("status", "active")
    .single()

  return (
    <div className="flex flex-col">
      <DashboardHeader title="My Profile" />
      <div className="flex-1 p-6">
        <ProfileForm profile={profile} enrollment={enrollment} />
      </div>
    </div>
  )
}
