"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { AssessmentType } from "@/lib/types"

interface CreateAssessmentData {
    course_id: string
    module_id?: string
    title: string
    description?: string
    assessment_type: AssessmentType
    total_points: number
    passing_score: number
    due_date?: string
    attachment_url?: string
    submission_type: "file" | "text" | "both"
    // Quiz-specific settings
    time_limit_minutes?: number
    shuffle_questions?: boolean
    show_feedback?: boolean
}

import { createAssessmentSchema, submitAssignmentSchema, gradeSubmissionSchema } from "@/lib/validations/assessment"

export async function createAssessment(data: CreateAssessmentData) {
    const validation = createAssessmentSchema.safeParse(data)
    if (!validation.success) {
        return { error: validation.error.errors[0].message }
    }
    const validData = validation.data

    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return { error: "Unauthorized" }
    }

    // Verify the user is the instructor of the course
    const { data: course } = await supabase
        .from("courses")
        .select("instructor_id")
        .eq("id", validData.course_id)
        .single()

    if (!course || course.instructor_id !== user.id) {
        // Check if admin
        const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single()

        if (profile?.role !== "admin") {
            return { error: "You are not authorized to create assessments for this course" }
        }
    }

    const { error } = await supabase.from("assessments").insert({
        course_id: validData.course_id,
        module_id: validData.module_id || null,
        title: validData.title,
        description: validData.description || null,
        assessment_type: validData.assessment_type,
        total_points: validData.total_points,
        passing_score: validData.passing_score,
        due_date: validData.due_date || null,
        attachment_url: validData.attachment_url || null,
        submission_type: validData.submission_type,
        is_published: false,
        attempts_allowed: 1,
        shuffle_questions: validData.shuffle_questions ?? false,
        show_correct_answers: validData.show_feedback ?? false,
        time_limit_minutes: validData.time_limit_minutes || null,
    })

    if (error) {
        console.error("Error creating assessment:", error)
        return { error: "Failed to create assessment" }
    }

    revalidatePath(`/faculty/courses/${validData.course_id}`)
    return { success: true }
}

interface SubmitAssignmentData {
    assessment_id: string
    submission_type: "file" | "text"
    file_url?: string
    content?: string
}

export async function submitAssignment(data: SubmitAssignmentData) {
    const validation = submitAssignmentSchema.safeParse(data)
    if (!validation.success) {
        return { error: validation.error.errors[0].message }
    }
    const validData = validation.data

    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return { error: "Unauthorized" }
    }

    // Check if submission already exists
    console.log("Checking for existing submission...", { assessmentId: validData.assessment_id, userId: user.id })
    const { data: existing, error: fetchError } = await supabase
        .from("assessment_submissions")
        .select("id, status")
        .eq("assessment_id", validData.assessment_id)
        .eq("student_id", user.id)
        .single()

    if (fetchError && fetchError.code !== "PGRST116") {
        console.error("Error checking existing submission:", fetchError)
    }

    if (existing) {
        console.log("Updating existing submission:", existing.id)
        // Update existing submission
        if (existing.status === "graded") {
            return { error: "Cannot modify a graded submission" }
        }

        const { error } = await supabase
            .from("assessment_submissions")
            .update({
                submission_type: validData.submission_type,
                file_url: validData.file_url || null,
                content: validData.content || null,
                status: "submitted",
                submitted_at: new Date().toISOString(),
            })
            .eq("id", existing.id)

        if (error) {
            console.error("Error updating submission:", error)
            return { error: `Failed to update submission: ${error.message}` }
        }
    } else {
        console.log("Creating new submission...")
        // Create new submission
        const { error } = await supabase.from("assessment_submissions").insert({
            assessment_id: validData.assessment_id,
            student_id: user.id,
            submission_type: validData.submission_type,
            file_url: validData.file_url || null,
            content: validData.content || null,
            status: "submitted",
        })

        if (error) {
            console.error("Error creating submission:", error)
            return { error: `Failed to create submission: ${error.message} (${error.details})` }
        }
    }

    // Get course ID for revalidation
    const { data: assessment } = await supabase
        .from("assessments")
        .select("course_id")
        .eq("id", validData.assessment_id)
        .single()

    if (assessment) {
        revalidatePath(`/dashboard/courses/${assessment.course_id}`)
    }

    return { success: true }
}

export async function getStudentSubmission(assessmentId: string) {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return { error: "Unauthorized", data: null }
    }

    const { data, error } = await supabase
        .from("assessment_submissions")
        .select("*")
        .eq("assessment_id", assessmentId)
        .eq("student_id", user.id)
        .single()

    if (error && error.code !== "PGRST116") {
        // PGRST116 = no rows returned
        console.error("Error fetching submission:", error)
        return { error: "Failed to fetch submission", data: null }
    }

    return { data: data || null, error: null }
}

export async function toggleAssessmentPublish(assessmentId: string, isPublished: boolean) {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return { error: "Unauthorized" }
    }

    const { error } = await supabase
        .from("assessments")
        .update({ is_published: !isPublished })
        .eq("id", assessmentId)

    if (error) {
        console.error("Error toggling assessment:", error)
        return { error: "Failed to update assessment" }
    }

    return { success: true }
}

export async function deleteAssessment(assessmentId: string) {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return { error: "Unauthorized" }
    }

    const { error } = await supabase
        .from("assessments")
        .delete()
        .eq("id", assessmentId)

    if (error) {
        console.error("Error deleting assessment:", error)
        return { error: "Failed to delete assessment" }
    }

    return { success: true }
}

interface GradeSubmissionData {
    submission_id: string
    grade: number
    feedback?: string
}

export async function gradeSubmission(data: GradeSubmissionData) {
    const validation = gradeSubmissionSchema.safeParse(data)
    if (!validation.success) {
        return { error: validation.error.errors[0].message }
    }
    const validData = validation.data

    console.log("Server Action: gradeSubmission started", validData)
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        console.error("Server Action: No authenticated user")
        return { error: "Unauthorized" }
    }

    console.log("Server Action: User authenticated", user.id)

    const { error } = await supabase
        .from("assessment_submissions")
        .update({
            grade: validData.grade,
            feedback: validData.feedback,
            status: "graded",
            graded_at: new Date().toISOString(),
            graded_by: user.id
        })
        .eq("id", validData.submission_id)

    if (error) {
        console.error("Error grading submission:", error)
        return { error: "Failed to grade submission" }
    }

    // Get assessment ID for revalidation
    const { data: submission } = await supabase
        .from("assessment_submissions")
        .select("assessment_id")
        .eq("id", validData.submission_id)
        .single()

    if (submission) {
        revalidatePath(`/faculty/assessments/${submission.assessment_id}`)
        revalidatePath(`/faculty/assessments/${submission.assessment_id}/submissions/${validData.submission_id}`)
    }

    return { success: true }
}
