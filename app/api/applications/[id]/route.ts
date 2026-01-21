import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// Helper to validate UUID
function isValidUUID(uuid: string) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    return uuidRegex.test(uuid)
}

export async function GET(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params
    try {
        if (!isValidUUID(params.id)) {
            return NextResponse.json({ error: "Invalid ID" }, { status: 400 })
        }

        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // Fetch full application details including documents and recommendations
        const { data: application, error } = await supabase
            .from("applications")
            .select(`
        *,
        program:programs(*),
        documents:application_documents(*),
        recommendations(*)
      `)
            .eq("id", params.id)
            .single()

        if (error) {
            return NextResponse.json({ error: "Application not found" }, { status: 404 })
        }

        // Verify ownership (or admin role)
        // Note: RLS policies should handle this, but explicit check is good
        if (application.applicant_email !== user.email) {
            // Check if admin
            const { data: profile } = await supabase
                .from("profiles")
                .select("role")
                .eq("id", user.id)
                .single()

            if (!["admin", "registrar"].includes(profile?.role || "")) {
                return NextResponse.json({ error: "Forbidden" }, { status: 403 })
            }
        }

        return NextResponse.json(application)
    } catch (error) {
        console.error("Error fetching application:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}

export async function PATCH(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params
    try {
        if (!isValidUUID(params.id)) {
            return NextResponse.json({ error: "Invalid ID" }, { status: 400 })
        }

        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const json = await request.json()

        // Prevent updating protected fields via this route
        const {
            id,
            created_at,
            updated_at,
            status,
            applicant_email,
            ...updates
        } = json

        // Update application
        const { data, error } = await supabase
            .from("applications")
            .update(updates)
            .eq("id", params.id)
            .eq("applicant_email", user.email) // Ensure ownership
            .select()
            .single()

        if (error) {
            console.error("Update error:", error)
            return NextResponse.json({ error: "Failed to update application" }, { status: 500 })
        }

        return NextResponse.json(data)
    } catch (error) {
        console.error("Error updating application:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
