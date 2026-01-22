import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

interface HealthStatus {
    status: "healthy" | "degraded" | "unhealthy"
    timestamp: string
    version: string
    checks: {
        database: { status: "up" | "down"; latencyMs?: number }
        auth: { status: "up" | "down" }
        redis?: { status: "up" | "down" | "fallback" }
    }
}

export async function GET() {
    const startTime = Date.now()
    const checks: HealthStatus["checks"] = {
        database: { status: "down" },
        auth: { status: "down" },
    }

    let overallStatus: HealthStatus["status"] = "healthy"

    // Check database connection
    try {
        const supabase = await createClient()
        const dbStart = Date.now()
        const { error } = await supabase.from("profiles").select("id").limit(1)
        const dbLatency = Date.now() - dbStart

        if (error) {
            checks.database = { status: "down" }
            overallStatus = "unhealthy"
        } else {
            checks.database = { status: "up", latencyMs: dbLatency }
            if (dbLatency > 1000) {
                overallStatus = "degraded"
            }
        }
    } catch {
        checks.database = { status: "down" }
        overallStatus = "unhealthy"
    }

    // Check auth service
    try {
        const supabase = await createClient()
        const { error } = await supabase.auth.getSession()
        checks.auth = { status: error ? "down" : "up" }
        if (error) {
            overallStatus = overallStatus === "unhealthy" ? "unhealthy" : "degraded"
        }
    } catch {
        checks.auth = { status: "down" }
        overallStatus = overallStatus === "unhealthy" ? "unhealthy" : "degraded"
    }

    // Check Redis (if configured)
    const redisUrl = process.env.UPSTASH_REDIS_REST_URL
    const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN
    if (redisUrl && redisToken) {
        checks.redis = { status: "up" }
    } else {
        checks.redis = { status: "fallback" }
        // Not critical, but worth noting
    }

    const response: HealthStatus = {
        status: overallStatus,
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || "1.0.0",
        checks,
    }

    const statusCode = overallStatus === "unhealthy" ? 503 : 200

    return NextResponse.json(response, {
        status: statusCode,
        headers: {
            "Cache-Control": "no-store, no-cache, must-revalidate",
            "X-Response-Time": `${Date.now() - startTime}ms`,
        },
    })
}
