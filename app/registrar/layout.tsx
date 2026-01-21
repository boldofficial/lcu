import type { ReactNode } from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { RegistrarLayoutClient } from "./layout-client"

export default async function RegistrarLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile || profile.role !== "registrar") {
    redirect("/dashboard")
  }

  return <RegistrarLayoutClient profile={profile}>{children}</RegistrarLayoutClient>
}
