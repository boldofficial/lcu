import { z } from "zod"

export const applicationSchema = z.object({
    program_id: z.string().uuid({ message: "Invalid program selected" }),

    // Personal Info
    first_name: z.string().min(2, "First name must be at least 2 characters"),
    last_name: z.string().min(2, "Last name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(10, "Phone number must be at least 10 digits"),
    date_of_birth: z.string().refine((date) => !isNaN(Date.parse(date)), {
        message: "Invalid date of birth",
    }),

    // Address
    address: z.string().min(5, "Address must be at least 5 characters"),
    city: z.string().min(2, "City is required"),
    state: z.string().min(2, "State is required"),
    zip_code: z.string().min(5, "Zip code is required"),
    country: z.string().min(2, "Country is required"),

    // Academic History
    previous_institution: z.string().min(2, "Institution name is required"),
    previous_degree: z.string().min(2, "Degree is required"),
    graduation_year: z.number().int().min(1950).max(new Date().getFullYear()),
    gpa: z.number().min(0).max(4.0),

    // Essay
    personal_statement: z.string().min(100, "Personal statement must be at least 100 characters"),
})

export type ApplicationData = z.infer<typeof applicationSchema>
