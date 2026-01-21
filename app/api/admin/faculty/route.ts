import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { z } from "zod"

const createFacultySchema = z.object({
    email: z.string().email("Invalid email address"),
    first_name: z.string().min(2, "First name is required"),
    last_name: z.string().min(2, "Last name is required"),
    phone: z.string().optional(),
    bio: z.string().optional(),
    temp_password: z.string().min(8, "Password must be at least 8 characters"),
})

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()

        // Check authentication and admin role
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single()

        if (!["admin"].includes(profile?.role || "")) {
            return NextResponse.json({ error: "Only admins can create faculty" }, { status: 403 })
        }

        const json = await request.json()
        const body = createFacultySchema.parse(json)

        // Check if email already exists in profiles
        const { data: existingProfile } = await supabase
            .from("profiles")
            .select("id")
            .eq("email", body.email)
            .single()

        if (existingProfile) {
            return NextResponse.json({ error: "A user with this email already exists" }, { status: 400 })
        }

        // Create auth user with the provided password
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: body.email,
            password: body.temp_password,
            options: {
                data: {
                    first_name: body.first_name,
                    last_name: body.last_name,
                    role: "faculty",
                },
            },
        })

        if (authError) {
            console.error("Auth error:", authError)
            return NextResponse.json({ error: authError.message }, { status: 400 })
        }

        if (!authData.user) {
            return NextResponse.json({ error: "Failed to create user account" }, { status: 500 })
        }

        // Create or update faculty profile
        const { data: faculty, error: profileError } = await supabase
            .from("profiles")
            .upsert({
                id: authData.user.id,
                email: body.email,
                first_name: body.first_name,
                last_name: body.last_name,
                phone: body.phone || null,
                bio: body.bio || null,
                role: "faculty",
                is_active: true,
            })
            .select()
            .single()

        if (profileError) {
            console.error("Profile error:", profileError)
            return NextResponse.json({ error: "Failed to create faculty profile" }, { status: 500 })
        }

        return NextResponse.json({
            ...faculty,
            message: `Faculty account created. They can login with email: ${body.email} and the provided password.`,
        })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: "Validation error", details: error.errors }, { status: 400 })
        }
        console.error("Internal error:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

export async function GET() {
    try {
        const supabase = await createClient()

        const { data: faculty, error } = await supabase
            .from("profiles")
            .select(`
        *,
        courses:courses!courses_instructor_id_fkey(id, name, code)
      `)
            .eq("role", "faculty")
            .order("last_name", { ascending: true })

        if (error) {
            return NextResponse.json({ error: "Failed to fetch faculty" }, { status: 500 })
        }

        return NextResponse.json(faculty)
    } catch (error) {
        console.error("Error fetching faculty:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
