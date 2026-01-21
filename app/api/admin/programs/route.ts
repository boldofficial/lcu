import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { z } from "zod"

const createProgramSchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters"),
    code: z.string().min(2, "Code is required"),
    description: z.string().optional(),
    degree_type: z.enum(["certificate", "associate", "bachelor", "master", "doctorate"]),
    department: z.string().min(2, "Department is required"),
    total_credits: z.number().min(1, "Credits must be at least 1"),
    duration_months: z.number().min(1, "Duration must be at least 1 month"),
    tuition_amount: z.number().min(0, "Tuition must be positive"),
    application_fee: z.number().min(0, "Application fee must be positive").optional().default(50),
    cover_image: z.string().optional(),
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
        const body = createProgramSchema.parse(json)

        // Check if code already exists
        const { data: existing } = await supabase
            .from("programs")
            .select("id")
            .eq("code", body.code)
            .single()

        if (existing) {
            return NextResponse.json({ error: "Program code already exists" }, { status: 400 })
        }

        const { data: program, error } = await supabase
            .from("programs")
            .insert(body)
            .select()
            .single()

        if (error) {
            console.error("Database error:", error)
            return NextResponse.json({ error: "Failed to create program" }, { status: 500 })
        }

        return NextResponse.json(program)
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

        const { data: programs, error } = await supabase
            .from("programs")
            .select("*")
            .order("name", { ascending: true })

        if (error) {
            return NextResponse.json({ error: "Failed to fetch programs" }, { status: 500 })
        }

        return NextResponse.json(programs)
    } catch (error) {
        console.error("Error fetching programs:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
