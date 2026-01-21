import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://landmarkchristian.edu"

    return {
        rules: [
            {
                userAgent: "*",
                allow: "/",
                disallow: [
                    "/admin/",
                    "/dashboard/",
                    "/faculty/",
                    "/registrar/",
                    "/api/",
                    "/auth/",
                    "/apply/personal",
                    "/apply/academic",
                    "/apply/essay",
                    "/apply/documents",
                    "/apply/payment",
                    "/apply/review",
                ],
            },
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
    }
}
