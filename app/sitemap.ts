import type { MetadataRoute } from "next"
import { createClient } from "@supabase/supabase-js"

export const dynamic = "force-dynamic"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://landmarkchristian.edu"

    // Use direct client for sitemap to avoid cookie dependencies during build
    // This is safe because we only fetch public data (programs, posts)
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Static pages
    const staticPages: MetadataRoute.Sitemap = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 1,
        },
        {
            url: `${baseUrl}/programs`,
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 0.9,
        },
        {
            url: `${baseUrl}/about`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.8,
        },
        {
            url: `${baseUrl}/blog`,
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 0.8,
        },
        {
            url: `${baseUrl}/apply`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.9,
        },
        {
            url: `${baseUrl}/terms`,
            lastModified: new Date(),
            changeFrequency: "yearly",
            priority: 0.3,
        },
        {
            url: `${baseUrl}/privacy`,
            lastModified: new Date(),
            changeFrequency: "yearly",
            priority: 0.3,
        },
        {
            url: `${baseUrl}/contact`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.5,
        },
        {
            url: `${baseUrl}/faq`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.5,
        },
    ]

    try {
        // Dynamic program pages
        const { data: programs } = await supabase
            .from("programs")
            .select("id, updated_at")
            .eq("is_active", true)

        const programPages: MetadataRoute.Sitemap = (programs || []).map((program) => ({
            url: `${baseUrl}/programs/${program.id}`,
            lastModified: new Date(program.updated_at),
            changeFrequency: "monthly" as const,
            priority: 0.7,
        }))

        // Dynamic blog posts
        const { data: posts } = await supabase
            .from("posts")
            .select("slug, updated_at")
            .eq("is_published", true)

        const blogPages: MetadataRoute.Sitemap = (posts || []).map((post) => ({
            url: `${baseUrl}/blog/${post.slug}`,
            lastModified: new Date(post.updated_at),
            changeFrequency: "weekly" as const,
            priority: 0.6,
        }))

        return [...staticPages, ...programPages, ...blogPages]
    } catch (error) {
        console.error("Sitemap generation error:", error)
        return staticPages
    }
}
