import { z } from "zod"

/**
 * Environment variable validation schema
 * Validates required environment variables at build/runtime
 */
const envSchema = z.object({
    // Supabase
    NEXT_PUBLIC_SUPABASE_URL: z.string().url("NEXT_PUBLIC_SUPABASE_URL must be a valid URL"),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, "NEXT_PUBLIC_SUPABASE_ANON_KEY is required"),

    // Optional: Service role key (server-side only)
    SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),

    // Node environment
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

    // Optional: Analytics
    NEXT_PUBLIC_VERCEL_ANALYTICS_ID: z.string().optional(),
})

export type Env = z.infer<typeof envSchema>

/**
 * Validated environment variables
 * Throws error at startup if required variables are missing
 */
function validateEnv(): Env {
    const parsed = envSchema.safeParse({
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
        NODE_ENV: process.env.NODE_ENV,
        NEXT_PUBLIC_VERCEL_ANALYTICS_ID: process.env.NEXT_PUBLIC_VERCEL_ANALYTICS_ID,
    })

    if (!parsed.success) {
        console.error("❌ Invalid environment variables:")
        console.error(parsed.error.flatten().fieldErrors)
        throw new Error("Invalid environment variables")
    }

    return parsed.data
}

export const env = validateEnv()
