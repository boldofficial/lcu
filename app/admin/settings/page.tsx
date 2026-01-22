import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Users } from "lucide-react"
import { AddAdminModal } from "@/components/admin/add-admin-modal"
import { AdminList } from "@/components/admin/admin-list"

export default async function AdminSettingsPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        redirect("/auth/login")
    }

    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single()

    if (profile?.role !== "admin") {
        redirect("/dashboard")
    }

    return (
        <div className="space-y-8 pb-8">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Settings</h1>
                    <p className="text-muted-foreground italic">Manage system settings and administrator accounts</p>
                </div>
            </div>

            {/* Admin Management Section */}
            <Card className="border-none shadow-md overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <Shield className="h-5 w-5" />
                            </div>
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    Administrator Management
                                </CardTitle>
                                <CardDescription>
                                    Add or manage users with full admin access to this portal
                                </CardDescription>
                            </div>
                        </div>
                        <AddAdminModal />
                    </div>
                </CardHeader>
                <CardContent className="p-6">
                    <AdminList currentUserId={user.id} />
                </CardContent>
            </Card>

            {/* Placeholder for future settings sections */}
            <Card className="border-dashed border-2 bg-muted/30">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                    <Users className="h-12 w-12 text-muted-foreground/50 mb-4" />
                    <h3 className="text-lg font-medium text-muted-foreground">More Settings Coming Soon</h3>
                    <p className="text-sm text-muted-foreground/70 max-w-md mt-1">
                        Additional configuration options like email templates, system preferences, and integrations will be available here.
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
