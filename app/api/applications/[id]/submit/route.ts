import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // 1. Verify application exists and belongs to user
        const { data: application, error: fetchError } = await supabase
            .from("applications")
            .select("status")
            .eq("id", params.id)
            .eq("applicant_email", user.email)
            .single()

        if (fetchError || !application) {
            return NextResponse.json({ error: "Application not found" }, { status: 404 })
        }

        if (application.status !== "draft") {
            return NextResponse.json({ error: "Application is already submitted" }, { status: 400 })
        }

        // 2. Validate all required fields are present (server-side validation)
        // TODO: rigorous validation here

        // 3. Update status to submitted
        const { data, error: updateError } = await supabase
            .from("applications")
            .update({
                status: "submitted",
                submitted_at: new Date().toISOString(),
                current_step: 8 // Completed
            })
            .eq("id", params.id)
            .select()
            .single()

        if (updateError) {
            throw updateError
        }

        // 4. Send confirmation email (simulated)
        // await sendEmail(...)

        return NextResponse.json(data)
    } catch (error) {
        console.error("Error submitting application:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
