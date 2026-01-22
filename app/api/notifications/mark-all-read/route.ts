import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { markAllAsRead } from "@/lib/notifications"

export async function POST(request: Request) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const success = await markAllAsRead(user.id)
    return NextResponse.json({ success })
}
