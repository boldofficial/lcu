"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const createStudentSchema = z.object({
    email: z.string().email(),
    firstName: z.string().min(2),
    lastName: z.string().min(2),
    password: z.string().min(6), // Optional in UI, but required for API
})

export async function createStudent(prevState: any, formData: FormData) {
    try {
        const rawData = {
            email: formData.get("email"),
            firstName: formData.get("firstName"),
            lastName: formData.get("lastName"),
            password: formData.get("password") || Math.random().toString(36).slice(-8) + "Aa1!",
        }

        const validated = createStudentSchema.parse(rawData)
        const supabase = createAdminClient()

        const { data: user, error } = await supabase.auth.admin.createUser({
            email: validated.email,
            password: validated.password,
            email_confirm: true,
            user_metadata: {
                first_name: validated.firstName,
                last_name: validated.lastName,
                role: "student",
            },
        })

        if (error) {
            console.error("Create User Error:", error)
            return { error: error.message }
        }

        if (!user.user) {
            return { error: "User creation failed unexpectedly" }
        }

        // Trigger revalidation of the students list
        revalidatePath("/admin/students")
        return { success: true, message: `Student created! Password: ${validated.password}` }

    } catch (err: any) {
        console.error("Action Error:", err)
        if (err instanceof z.ZodError) {
            return { error: err.errors[0].message }
        }
        if (err.message === "Missing SUPABASE_SERVICE_ROLE_KEY") {
            return { error: "Configuration Error: Service Role Key is missing." }
        }
        return { error: "Failed to create student" }
    }
}

export async function deleteStudent(userId: string) {
    try {
        const supabase = createAdminClient()
        const { error } = await supabase.auth.admin.deleteUser(userId)

        if (error) throw error

        revalidatePath("/admin/students")
        return { success: true }
    } catch (error: any) {
        console.error("Delete Error:", error)
        return { error: error.message }
    }
}

export async function toggleStudentStatus(userId: string, isActive: boolean) {
    // This requires updating the profile AND potentially banning the user in Auth
    // For now, we'll just update the profile which controls access in our app logic
    try {
        // Use standard client for table updates if RLS allows admin access, 
        // OR use admin client to bypass RLS. Admin client is safer here.
        const supabase = createAdminClient()

        const { error } = await supabase
            .from("profiles")
            .update({ is_active: isActive })
            .eq("id", userId)

        if (error) throw error

        revalidatePath("/admin/students")
        return { success: true }
    } catch (error: any) {
        return { error: error.message }
    }
}
