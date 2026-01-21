import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { z } from "zod"

const createCourseSchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters"),
    code: z.string().min(2, "Code is required"),
    description: z.string().optional(),
    program_id: z.string().uuid("Invalid program ID"),
    credits: z.number().min(1, "Credits must be at least 1"),
    duration_weeks: z.number().min(1, "Duration must be at least 1 week").optional().default(8),
    instructor_id: z.string().uuid("Invalid instructor ID").optional().nullable(),
    is_active: z.boolean().optional().default(true),
})

export async function POST(request: NextRequest) {
    try {
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

        if (!["admin", "registrar"].includes(profile?.role || "")) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        const json = await request.json()
        const body = createCourseSchema.parse(json)

        // Check if code already exists
        const { data: existing } = await supabase
            .from("courses")
            .select("id")
            .eq("code", body.code)
            .single()

        if (existing) {
            return NextResponse.json({ error: "Course code already exists" }, { status: 400 })
        }

        const { data: course, error } = await supabase
            .from("courses")
            .insert(body)
            .select()
            .single()

        if (error) {
            console.error("Database error:", error)
            return NextResponse.json({ error: "Failed to create course" }, { status: 500 })
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

export async function GET() {
    try {
        const supabase = await createClient()

        const { data: courses, error } = await supabase
            .from("courses")
            .select(`
        *,
        program:programs(id, name),
        instructor:profiles(id, first_name, last_name)
      `)
            .order("code", { ascending: true })

        if (error) {
            return NextResponse.json({ error: "Failed to fetch courses" }, { status: 500 })
        }

        return NextResponse.json(courses)
    } catch (error) {
        console.error("Error fetching courses:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
