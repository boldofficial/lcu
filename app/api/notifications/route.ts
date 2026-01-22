import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { getNotifications, createNotification } from "@/lib/notifications"

export async function GET(request: Request) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get("limit") || "20")

    const notifications = await getNotifications(user.id, limit)
    return NextResponse.json(notifications)
}

export async function POST(request: Request) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin/faculty/registrar to send system notifications
    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single()

    if (!profile || profile.role === "student") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const json = await request.json()
    const notification = await createNotification(json)

    if (!notification) {
        return NextResponse.json({ error: "Failed to create notification" }, { status: 500 })
    }

    return NextResponse.json(notification)
}
