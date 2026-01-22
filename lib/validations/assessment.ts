import { z } from "zod"

export const createAssessmentSchema = z.object({
    course_id: z.string().uuid(),
    module_id: z.string().uuid().optional(),
    title: z.string().min(3, "Title must be at least 3 characters").max(100),
    description: z.string().optional(),
    assessment_type: z.enum(["quiz", "assignment", "exam", "discussion", "project"]),
    total_points: z.number().int().min(1, "Total points must be at least 1"),
    passing_score: z.number().int().min(0),
    due_date: z.string().optional(),
    attachment_url: z.string().url().optional().or(z.literal("")),
    submission_type: z.enum(["file", "text", "both"]),
    // Quiz-specific settings
    time_limit_minutes: z.number().int().min(1).optional(),
    shuffle_questions: z.boolean().optional(),
    show_feedback: z.boolean().optional(),
}).refine((data) => data.passing_score <= data.total_points, {
    message: "Passing score cannot be higher than total points",
    path: ["passing_score"],
})

export const submitAssignmentSchema = z.object({
    assessment_id: z.string().uuid(),
    submission_type: z.enum(["file", "text"]),
    file_url: z.string().url().optional(),
    content: z.string().optional(),
}).refine((data) => {
    if (data.submission_type === "file" && !data.file_url) return false
    if (data.submission_type === "text" && !data.content) return false
    return true
}, {
    message: "Content or file is required based on submission type",
})

export const gradeSubmissionSchema = z.object({
    submission_id: z.string().uuid(),
    grade: z.number().min(0),
    feedback: z.string().optional(),
})
