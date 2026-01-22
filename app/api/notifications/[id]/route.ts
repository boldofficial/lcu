import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { markAsRead, deleteNotification } from "@/lib/notifications"

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const success = await markAsRead(id)
    return NextResponse.json({ success })
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const success = await deleteNotification(id)
    return NextResponse.json({ success })
}
