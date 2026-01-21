import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/header"
import { EnrollmentFlow } from "@/components/enrollment/enrollment-flow"

export default async function EnrollPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  // Check if student already has an active enrollment
  const { data: existingEnrollment } = await supabase
    .from("enrollments")
    .select("*, program:programs(*)")
    .eq("student_id", user.id)
    .eq("status", "active")
    .single()

  if (existingEnrollment) {
    redirect("/dashboard")
  }

  // Get available programs
  const { data: programs } = await supabase
    .from("programs")
    .select("*")
    .eq("is_active", true)
    .order("degree_type", { ascending: true })

  return (
    <div className="flex flex-col">
      <DashboardHeader title="Program Enrollment" />
      <div className="flex-1 p-6">
        <EnrollmentFlow programs={programs || []} studentId={user.id} />
      </div>
    </div>
  )
}
