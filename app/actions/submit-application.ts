"use server"

import { createClient } from "@/lib/supabase/server"
import { sendApplicationReceivedEmail } from "@/lib/email"
import { ApplicationFormData } from "@/lib/types"

import { applicationSchema } from "@/lib/validations/application"

export async function submitApplication(formData: Partial<ApplicationFormData>) {
    const supabase = await createClient()

    // Validate with Zod
    const validationResult = applicationSchema.safeParse(formData)

    if (!validationResult.success) {
        return { success: false, error: validationResult.error.errors[0].message }
    }

    const validData = validationResult.data


    try {
        // 2. Insert into 'applications' table
        // We'll map form data to DB columns.
        const applicationData = {
            applicant_email: validData.email,
            applicant_first_name: validData.first_name,
            applicant_last_name: validData.last_name,
            applicant_phone: validData.phone,
            applicant_date_of_birth: validData.date_of_birth,
            applicant_address: validData.address,
            applicant_city: validData.city,
            applicant_state: validData.state,
            applicant_zip_code: validData.zip_code,
            applicant_country: validData.country,
            program_id: validData.program_id,
            status: "submitted",
            current_step: 8,
            previous_institution: validData.previous_institution,
            previous_degree: validData.previous_degree,
            graduation_year: validData.graduation_year,
            gpa: validData.gpa,
            personal_statement: validData.personal_statement,
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
            const { data: prog } = await supabase.from('programs').select('name').eq('id', validData.program_id).single()
            if (prog) programName = prog.name
        }

        // Trigger email (fire and forget or await?)
        // Better to await to report failure? Or not block user?
        // We'll await to ensure it works for this demo.
        await sendApplicationReceivedEmail(
            validData.email,
            validData.first_name,
            programName
        )

        return { success: true, applicationId: data.id }

    } catch (err) {
        console.error("Unexpected error:", err)
        return { success: false, error: "An unexpected error occurred" }
    }
}
