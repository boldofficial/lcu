import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/header"
import { NotificationPanel } from "@/components/notifications/notification-panel"

export default async function NotificationsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect("/auth/login")
    }

    return (
        <div className="flex flex-col">
            <DashboardHeader title="Notifications" />
            <div className="flex-1 p-6 max-w-5xl mx-auto w-full">
                <NotificationPanel userId={user.id} />
            </div>
        </div>
    )
}
