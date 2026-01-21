"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function markLessonComplete(lessonId: string, courseId: string) {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return { error: "Unauthorized" }
    }

    // 1. Mark lesson as complete
    console.log(`Marking lesson ${lessonId} complete for user ${user.id}`)
    const { error: progressError } = await supabase.from("lesson_progress").upsert(
        {
            lesson_id: lessonId,
            student_id: user.id,
            status: "completed",
            progress_percentage: 100,
            completed_at: new Date().toISOString(),
            last_accessed_at: new Date().toISOString(),
        },
        { onConflict: "lesson_id, student_id" },
    )

    if (progressError) {
        console.error("Error marking lesson complete:", progressError)
        return { error: "Failed to mark lesson as complete" }
    }
    console.log("Lesson marked complete successfully. Recalculating course progress...")

    // 2. Recalculate Course Progress
    // Get all published modules for this course
    const { data: courseModules } = await supabase
        .from("modules")
        .select("id")
        .eq("course_id", courseId)
        .eq("is_published", true)

    if (courseModules && courseModules.length > 0) {
        const moduleIds = courseModules.map((m) => m.id)

        // Get total published lessons count
        const { count: totalLessons } = await supabase
            .from("lessons")
            .select("*", { count: "exact", head: true })
            .in("module_id", moduleIds)
            .eq("is_published", true)

        if (totalLessons && totalLessons > 0) {
            // Get all valid lesson IDs for this course
            const { data: courseLessons } = await supabase
                .from("lessons")
                .select("id")
                .in("module_id", moduleIds)
                .eq("is_published", true)

            const validLessonIds = courseLessons?.map(l => l.id) || []

            if (validLessonIds.length > 0) {
                // Count completed lessons that match the valid IDs
                const { count: safeCompletedCount } = await supabase
                    .from("lesson_progress")
                    .select("*", { count: "exact", head: true })
                    .eq("student_id", user.id)
                    .eq("status", "completed")
                    .in("lesson_id", validLessonIds)

                const completed = safeCompletedCount || 0
                const percentage = Math.round((completed / totalLessons) * 100)
                const newStatus = percentage === 100 ? 'completed' : 'in_progress'

                console.log(`Progress Update: ${completed}/${totalLessons} lessons (${percentage}%). New Status: ${newStatus}`)

                // Update Course Enrollment
                const { error: updateError } = await supabase
                    .from("course_enrollments")
                    .update({
                        progress_percentage: percentage,
                        status: newStatus,
                        last_accessed_at: new Date().toISOString()
                    })
                    .eq("course_id", courseId)
                    .eq("student_id", user.id)

                if (updateError) {
                    console.error("Error updating course enrollment:", updateError)
                } else {
                    console.log("Course enrollment updated successfully")
                }
            }
        }
    }

    revalidatePath(`/dashboard/courses/${courseId}`)
    return { success: true }
}
