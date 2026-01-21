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
}

export async function createAssessment(data: CreateAssessmentData) {
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
        .eq("id", data.course_id)
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
        course_id: data.course_id,
        module_id: data.module_id || null,
        title: data.title,
        description: data.description || null,
        assessment_type: data.assessment_type,
        total_points: data.total_points,
        passing_score: data.passing_score,
        due_date: data.due_date || null,
        attachment_url: data.attachment_url || null,
        submission_type: data.submission_type,
        is_published: false,
        attempts_allowed: 1,
        shuffle_questions: false,
        show_correct_answers: false,
    })

    if (error) {
        console.error("Error creating assessment:", error)
        return { error: "Failed to create assessment" }
    }

    revalidatePath(`/faculty/courses/${data.course_id}`)
    return { success: true }
}

interface SubmitAssignmentData {
    assessment_id: string
    submission_type: "file" | "text"
    file_url?: string
    content?: string
}

export async function submitAssignment(data: SubmitAssignmentData) {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return { error: "Unauthorized" }
    }

    // Validate submission data
    if (data.submission_type === "file" && !data.file_url) {
        return { error: "File URL is required for file submissions" }
    }
    if (data.submission_type === "text" && !data.content) {
        return { error: "Content is required for text submissions" }
    }

    // Check if submission already exists
    console.log("Checking for existing submission...", { assessmentId: data.assessment_id, userId: user.id })
    const { data: existing, error: fetchError } = await supabase
        .from("assessment_submissions")
        .select("id, status")
        .eq("assessment_id", data.assessment_id)
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
                submission_type: data.submission_type,
                file_url: data.file_url || null,
                content: data.content || null,
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
            assessment_id: data.assessment_id,
            student_id: user.id,
            submission_type: data.submission_type,
            file_url: data.file_url || null,
            content: data.content || null,
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
        .eq("id", data.assessment_id)
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
    console.log("Server Action: gradeSubmission started", data)
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
            grade: data.grade,
            feedback: data.feedback,
            status: "graded",
            graded_at: new Date().toISOString(),
            graded_by: user.id
        })
        .eq("id", data.submission_id)

    if (error) {
        console.error("Error grading submission:", error)
        return { error: "Failed to grade submission" }
    }

    // Get assessment ID for revalidation
    const { data: submission } = await supabase
        .from("assessment_submissions")
        .select("assessment_id")
        .eq("id", data.submission_id)
        .single()

    if (submission) {
        revalidatePath(`/faculty/assessments/${submission.assessment_id}`)
        revalidatePath(`/faculty/assessments/${submission.assessment_id}/submissions/${data.submission_id}`)
    }

    return { success: true }
}
