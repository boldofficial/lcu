import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { z } from "zod"

const updateFacultySchema = z.object({
    first_name: z.string().min(2, "First name is required").optional(),
    last_name: z.string().min(2, "Last name is required").optional(),
    phone: z.string().optional().nullable(),
    bio: z.string().optional().nullable(),
    is_active: z.boolean().optional(),
})

// GET single faculty member
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const supabase = await createClient()

        const { data: faculty, error } = await supabase
            .from("profiles")
            .select(`
        *,
        courses:courses!courses_instructor_id_fkey(id, name, code)
      `)
            .eq("id", id)
            .eq("role", "faculty")
            .single()

        if (error || !faculty) {
            return NextResponse.json({ error: "Faculty not found" }, { status: 404 })
        }

        return NextResponse.json(faculty)
    } catch (error) {
        console.error("Error fetching faculty:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

// UPDATE faculty member
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const supabase = await createClient()

        // Check authentication and admin role
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single()

        if (!["admin"].includes(profile?.role || "")) {
            return NextResponse.json({ error: "Only admins can update faculty" }, { status: 403 })
        }

        const json = await request.json()
        const body = updateFacultySchema.parse(json)

        const { data: faculty, error } = await supabase
            .from("profiles")
            .update({
                ...body,
                updated_at: new Date().toISOString(),
            })
            .eq("id", id)
            .eq("role", "faculty")
            .select()
            .single()

        if (error) {
            console.error("Database error:", error)
            return NextResponse.json({ error: "Failed to update faculty member" }, { status: 500 })
        }

        return NextResponse.json(faculty)
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: "Validation error", details: error.errors }, { status: 400 })
        }
        console.error("Internal error:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

// DELETE faculty member
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const supabase = await createClient()

        // Check authentication and admin role
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single()

        if (!["admin"].includes(profile?.role || "")) {
            return NextResponse.json({ error: "Only admins can delete faculty" }, { status: 403 })
        }

        // Set faculty to inactive rather than deleting
        const { error } = await supabase
            .from("profiles")
            .update({ is_active: false, updated_at: new Date().toISOString() })
            .eq("id", id)
            .eq("role", "faculty")

        if (error) {
            return NextResponse.json({ error: "Failed to delete faculty member" }, { status: 500 })
        }

        return NextResponse.json({ message: "Faculty member deactivated" })
    } catch (error) {
        console.error("Error deleting faculty:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
