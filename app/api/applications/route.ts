import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { z } from "zod"

// Schema for initial application creation
const createApplicationSchema = z.object({
    program_id: z.string().uuid(),
})

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()

        // Check authentication
        const { data: { user } } = await supabase.auth.getUser()
        if (!user || user.is_anonymous) {
            return NextResponse.json(
                { error: "Unauthorized. Please sign in to apply." },
                { status: 401 }
            )
        }

        const json = await request.json()
        const body = createApplicationSchema.parse(json)

        // Check if user already has an active application
        // A user can have multiple applications, but maybe limit to one active per program?
        // For now, let's just create a new one.

        // Get user profile data to pre-fill
        const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single()

        const { data: application, error } = await supabase
            .from("applications")
            .insert({
                applicant_email: user.email,
                program_id: body.program_id,
                applicant_first_name: profile?.first_name || "",
                applicant_last_name: profile?.last_name || "",
                applicant_phone: profile?.phone,
                status: "draft",
                current_step: 2, // Move to step 2 after creation
            })
            .select()
            .single()

        if (error) {
            console.error("Database error:", error)
            return NextResponse.json(
                { error: "Failed to create application" },
                { status: 500 }
            )
        }

        return NextResponse.json(application)
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Validation error", details: error.errors },
                { status: 400 }
            )
        }
        console.error("Internal error:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        // Get user's applications
        const { data: applications, error } = await supabase
            .from("applications")
            .select("*, program:programs(name, degree_type)")
            .eq("applicant_email", user.email)
            .order("created_at", { ascending: false })

        if (error) {
            throw error
        }

        return NextResponse.json(applications)
    } catch (error) {
        console.error("Error fetching applications:", error)
        return NextResponse.json(
            { error: "Failed to fetch applications" },
            { status: 500 }
        )
    }
}
