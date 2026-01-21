import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

/**
 * Next.js Middleware for route protection
 * Runs before every request to protected routes
 */
export async function middleware(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    )
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // Refresh session if exists
    const {
        data: { user },
    } = await supabase.auth.getUser()

    const pathname = request.nextUrl.pathname

    // Protected routes that require authentication
    const protectedRoutes = [
        "/admin",
        "/dashboard",
        "/faculty",
        "/registrar",
        // Note: /apply/* routes intentionally NOT protected
        // The application forms allow guest users to sign up during the process
    ]

    // Check if current path starts with any protected route
    const isProtectedRoute = protectedRoutes.some(
        (route) => pathname === route || pathname.startsWith(`${route}/`)
    )

    // Redirect to login if accessing protected route without auth
    if (isProtectedRoute && !user) {
        const redirectUrl = new URL("/auth/login", request.url)
        redirectUrl.searchParams.set("next", pathname)
        return NextResponse.redirect(redirectUrl)
    }

    // Role-based route protection
    if (user) {
        const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single()

        const role = profile?.role

        // Admin routes - only admin role
        if (pathname.startsWith("/admin") && role !== "admin") {
            return NextResponse.redirect(new URL("/dashboard", request.url))
        }

        // Faculty routes - only faculty role
        if (pathname.startsWith("/faculty") && role !== "faculty") {
            return NextResponse.redirect(new URL("/dashboard", request.url))
        }

        // Registrar routes - only registrar role
        if (pathname.startsWith("/registrar") && role !== "registrar") {
            return NextResponse.redirect(new URL("/dashboard", request.url))
        }

        // Redirect authenticated users away from auth pages
        if (pathname.startsWith("/auth/") && !pathname.includes("callback")) {
            const dashboardPath = role === "admin" ? "/admin" :
                role === "faculty" ? "/faculty" :
                    role === "registrar" ? "/registrar" : "/dashboard"
            return NextResponse.redirect(new URL(dashboardPath, request.url))
        }
    }

    return supabaseResponse
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files (images, etc.)
         * - API routes (handled separately)
         */
        "/((?!_next/static|_next/image|favicon.ico|images|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
}
