import { createClient } from "@supabase/supabase-js"

export function createAdminClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseServiceKey) {
        console.error("SUPABASE_SERVICE_ROLE_KEY is missing. Admin actions will fail.")
        // We return a client that will likely fail on admin actions, or we could throw.
        // Throwing is safer so the dev knows immediately.
        throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY")
    }

    return createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    })
}
