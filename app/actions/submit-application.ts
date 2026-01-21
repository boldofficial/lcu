"use server"

import { createClient } from "@/lib/supabase/server"
import { sendApplicationReceivedEmail } from "@/lib/email"
import { ApplicationFormData } from "@/lib/types"

export async function submitApplication(formData: Partial<ApplicationFormData>) {
    const supabase = await createClient()

    // 1. Get current user (if logged in, though application might be public/anon?)
    // Assuming application is linked to user account for now, or just email.
    // However, the `Application` table usually links to an auth user if they signed up first?
    // Let's assume we proceed with data insertion.

    // Validate minimally
    if (!formData.email || !formData.first_name || !formData.last_name || !formData.program_id) {
        return { success: false, error: "Missing required fields" }
    }

    try {
        // 2. Insert into 'applications' table
        // We'll map form data to DB columns.
        const applicationData = {
            applicant_email: formData.email,
            applicant_first_name: formData.first_name,
            applicant_last_name: formData.last_name,
            applicant_phone: formData.phone || null,
            applicant_date_of_birth: formData.date_of_birth || null,
            applicant_address: formData.address || null,
            applicant_city: formData.city || null,
            applicant_state: formData.state || null,
            applicant_zip_code: formData.zip_code || null,
            applicant_country: formData.country || "US",
            program_id: formData.program_id,
            status: "submitted",
            current_step: 8,
            previous_institution: formData.previous_institution || null,
            previous_degree: formData.previous_degree || null,
            graduation_year: formData.graduation_year || null,
            gpa: formData.gpa || null,
            personal_statement: formData.personal_statement || null,
            submitted_at: new Date().toISOString(),
        }

        const { data, error } = await supabase
            .from("applications")
            .insert(applicationData)
            .select("id, program:programs(name)")
            .single()

        if (error) {
            console.error("Submission error:", error)
            return { success: false, error: "Failed to save application" }
        }

        // 3. Send Transactional Email
        // Note: program(name) join might not work on insert select if RLS/relation issue or if we didn't join.
        // We might need to fetch program name separately or assume it.
        // Let's fetch program name or pass it if easy.
        // For now, we'll try to get it.
        let programName = "your program"
        const programData = data?.program as unknown as { name: string } | null
        if (programData?.name) {
            programName = programData.name
        } else {
            // Fallback fetch
            const { data: prog } = await supabase.from('programs').select('name').eq('id', formData.program_id).single()
            if (prog) programName = prog.name
        }

        // Trigger email (fire and forget or await?)
        // Better to await to report failure? Or not block user?
        // We'll await to ensure it works for this demo.
        await sendApplicationReceivedEmail(
            formData.email,
            formData.first_name,
            programName
        )

        return { success: true, applicationId: data.id }

    } catch (err) {
        console.error("Unexpected error:", err)
        return { success: false, error: "An unexpected error occurred" }
    }
}
