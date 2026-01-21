import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
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
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
        },
      },
    },
  )

  // Protected routes list
  const protectedPaths = ["/dashboard", "/admin", "/faculty", "/registrar"]
  const isProtectedPath = protectedPaths.some((path) => request.nextUrl.pathname.startsWith(path))

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // If no session and trying to access protected route, redirect immediately
  if (!session && isProtectedPath) {
    const url = request.nextUrl.clone()
    url.pathname = "/auth/login"
    return NextResponse.redirect(url)
  }

  // Only call getUser if we have a session (this validates the session with the server)
  if (session) {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser()

      // If session is invalid/expired, redirect to login for protected routes
      if ((error || !user) && isProtectedPath) {
        const url = request.nextUrl.clone()
        url.pathname = "/auth/login"
        return NextResponse.redirect(url)
      }

      // Role-based access control
      if (user) {
        try {
          const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
          const role = profile?.role || "student"

          // Admin-only routes
          if (request.nextUrl.pathname.startsWith("/admin") && role !== "admin") {
            const url = request.nextUrl.clone()
            url.pathname = "/dashboard"
            return NextResponse.redirect(url)
          }

          // Faculty-only routes
          if (request.nextUrl.pathname.startsWith("/faculty") && !["admin", "faculty"].includes(role)) {
            const url = request.nextUrl.clone()
            url.pathname = "/dashboard"
            return NextResponse.redirect(url)
          }

          // Registrar-only routes
          if (request.nextUrl.pathname.startsWith("/registrar") && !["admin", "registrar"].includes(role)) {
            const url = request.nextUrl.clone()
            url.pathname = "/dashboard"
            return NextResponse.redirect(url)
          }
        } catch (profileError) {
          // Profile fetch failed, allow access but with default role
        }
      }
    } catch (error) {
      // getUser failed - session might be invalid, redirect for protected routes
      if (isProtectedPath) {
        const url = request.nextUrl.clone()
        url.pathname = "/auth/login"
        return NextResponse.redirect(url)
      }
    }
  }

  return supabaseResponse
}
