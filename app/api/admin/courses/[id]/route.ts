import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { z } from "zod"

const updateCourseSchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters").optional(),
    code: z.string().min(2, "Code is required").optional(),
    description: z.string().optional().nullable(),
    program_id: z.string().uuid("Invalid program ID").optional().nullable(),
    credits: z.number().min(1, "Credits must be at least 1").optional(),
    duration_weeks: z.number().min(1, "Duration must be at least 1 week").optional(),
    instructor_id: z.string().uuid().optional().nullable(),
    is_active: z.boolean().optional(),
})

// GET single course
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const supabase = await createClient()

        const { data: course, error } = await supabase
            .from("courses")
            .select(`
        *,
        program:programs(id, name, code),
        instructor:profiles(id, first_name, last_name, email)
      `)
            .eq("id", id)
            .single()

        if (error || !course) {
            return NextResponse.json({ error: "Course not found" }, { status: 404 })
        }

        return NextResponse.json(course)
    } catch (error) {
        console.error("Error fetching course:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

// UPDATE course
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const supabase = await createClient()

        // Check authentication and admin/registrar role
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single()

        if (!["admin", "registrar"].includes(profile?.role || "")) {
            return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
        }

        const json = await request.json()
        const body = updateCourseSchema.parse(json)

        const { data: course, error } = await supabase
            .from("courses")
            .update({
                ...body,
                updated_at: new Date().toISOString(),
            })
            .eq("id", id)
            .select(`
        *,
        program:programs(id, name, code),
        instructor:profiles(id, first_name, last_name, email)
      `)
            .single()

        if (error) {
            console.error("Database error:", error)
            return NextResponse.json({ error: "Failed to update course" }, { status: 500 })
        }

        return NextResponse.json(course)
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: "Validation error", details: error.errors }, { status: 400 })
        }
        console.error("Internal error:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

// DELETE course
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
            return NextResponse.json({ error: "Only admins can delete courses" }, { status: 403 })
        }

        // Set course to inactive rather than deleting
        const { error } = await supabase
            .from("courses")
            .update({ is_active: false, updated_at: new Date().toISOString() })
            .eq("id", id)

        if (error) {
            return NextResponse.json({ error: "Failed to delete course" }, { status: 500 })
        }

        return NextResponse.json({ message: "Course deactivated" })
    } catch (error) {
        console.error("Error deleting course:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
