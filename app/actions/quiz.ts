"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { z } from "zod"

// Validation Schemas
const addQuestionSchema = z.object({
    assessment_id: z.string().uuid(),
    question_text: z.string().min(3, "Question text is required"),
    question_type: z.enum(["multiple_choice", "true_false"]),
    options: z.array(z.string()).min(2, "At least 2 options required"),
    correct_answer_index: z.number().int().min(0),
    points: z.number().int().min(1).default(1),
    order_index: z.number().int().min(0).default(0)
})

const submitQuizSchema = z.object({
    assessment_id: z.string().uuid(),
    answers: z.array(z.object({
        question_id: z.string().uuid(),
        selected_option_index: z.number().int().min(0)
    }))
})

// Get quiz questions for an assessment
export async function getQuizQuestions(assessmentId: string) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from("quiz_questions")
        .select("*")
        .eq("assessment_id", assessmentId)
        .order("order_index", { ascending: true })

    if (error) {
        console.error("Error fetching quiz questions:", error)
        return { error: "Failed to fetch questions", data: null }
    }

    return { data, error: null }
}

// Add a quiz question
export async function addQuizQuestion(data: z.infer<typeof addQuestionSchema>) {
    const validation = addQuestionSchema.safeParse(data)
    if (!validation.success) {
        return { error: validation.error.errors[0].message }
    }
    const validData = validation.data

    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { error: "Unauthorized" }
    }

    // Verify user is instructor of this assessment's course
    const { data: assessment } = await supabase
        .from("assessments")
        .select("course_id, courses(instructor_id)")
        .eq("id", validData.assessment_id)
        .single()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const courses = assessment?.courses as any
    const instructorId = courses?.instructor_id

    if (!assessment || instructorId !== user.id) {
        // Check if admin
        const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single()

        if (profile?.role !== "admin") {
            return { error: "Not authorized to add questions to this assessment" }
        }
    }

    const { error } = await supabase.from("quiz_questions").insert({
        assessment_id: validData.assessment_id,
        question_text: validData.question_text,
        question_type: validData.question_type,
        options: validData.options,
        correct_answer_index: validData.correct_answer_index,
        points: validData.points,
        order_index: validData.order_index
    })

    if (error) {
        console.error("Error adding quiz question:", error)
        return { error: "Failed to add question" }
    }

    revalidatePath(`/faculty/courses`)
    return { success: true }
}

// Update an existing quiz question
export async function updateQuizQuestion(questionId: string, data: Partial<{
    question_text: string
    question_type: "multiple_choice" | "true_false"
    options: string[]
    correct_answer_index: number
    points: number
}>) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { error: "Unauthorized" }
    }

    const { error } = await supabase
        .from("quiz_questions")
        .update({
            question_text: data.question_text,
            question_type: data.question_type,
            options: data.options,
            correct_answer_index: data.correct_answer_index,
            points: data.points,
            updated_at: new Date().toISOString()
        })
        .eq("id", questionId)

    if (error) {
        console.error("Error updating quiz question:", error)
        return { error: "Failed to update question" }
    }

    revalidatePath(`/faculty/courses`)
    return { success: true }
}

// Delete a quiz question
export async function deleteQuizQuestion(questionId: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { error: "Unauthorized" }
    }

    const { error } = await supabase
        .from("quiz_questions")
        .delete()
        .eq("id", questionId)

    if (error) {
        console.error("Error deleting quiz question:", error)
        return { error: "Failed to delete question" }
    }

    revalidatePath(`/faculty/courses`)
    return { success: true }
}

// Submit a quiz attempt (auto-grading)
export async function submitQuizAttempt(data: z.infer<typeof submitQuizSchema>) {
    const validation = submitQuizSchema.safeParse(data)
    if (!validation.success) {
        return { error: validation.error.errors[0].message }
    }
    const validData = validation.data

    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { error: "Unauthorized" }
    }

    // Get all questions for this assessment
    const { data: questions, error: questionsError } = await supabase
        .from("quiz_questions")
        .select("*")
        .eq("assessment_id", validData.assessment_id)

    if (questionsError || !questions) {
        return { error: "Failed to fetch questions for grading" }
    }

    // Create or get submission
    let submissionId: string
    const { data: existingSubmission } = await supabase
        .from("assessment_submissions")
        .select("id, status")
        .eq("assessment_id", validData.assessment_id)
        .eq("student_id", user.id)
        .single()

    if (existingSubmission) {
        if (existingSubmission.status === "graded") {
            return { error: "Quiz already submitted and graded" }
        }
        submissionId = existingSubmission.id
    } else {
        const { data: newSubmission, error: submissionError } = await supabase
            .from("assessment_submissions")
            .insert({
                assessment_id: validData.assessment_id,
                student_id: user.id,
                submission_type: "text",
                status: "submitted"
            })
            .select("id")
            .single()

        if (submissionError || !newSubmission) {
            return { error: "Failed to create submission" }
        }
        submissionId = newSubmission.id
    }

    // Grade answers
    let totalPoints = 0
    let earnedPoints = 0
    const answerRecords = []

    for (const answer of validData.answers) {
        const question = questions.find(q => q.id === answer.question_id)
        if (!question) continue

        const isCorrect = question.correct_answer_index === answer.selected_option_index
        const pointsEarned = isCorrect ? question.points : 0

        totalPoints += question.points
        earnedPoints += pointsEarned

        answerRecords.push({
            submission_id: submissionId,
            question_id: answer.question_id,
            selected_option_index: answer.selected_option_index,
            is_correct: isCorrect,
            points_earned: pointsEarned
        })
    }

    // Insert all answers
    const { error: answersError } = await supabase
        .from("quiz_answers")
        .upsert(answerRecords, { onConflict: "submission_id, question_id" })

    if (answersError) {
        console.error("Error saving quiz answers:", answersError)
        return { error: "Failed to save answers" }
    }

    // Update submission with grade
    const gradePercentage = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0

    const { error: updateError } = await supabase
        .from("assessment_submissions")
        .update({
            grade: gradePercentage,
            status: "graded",
            graded_at: new Date().toISOString(),
            content: `Quiz completed: ${earnedPoints}/${totalPoints} points`
        })
        .eq("id", submissionId)

    if (updateError) {
        console.error("Error updating submission grade:", updateError)
        return { error: "Failed to save grade" }
    }

    revalidatePath(`/dashboard/courses`)
    return {
        success: true,
        grade: gradePercentage,
        earnedPoints,
        totalPoints
    }
}
