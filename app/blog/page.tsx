import Link from "next/link"
import Image from "next/image"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, User } from "lucide-react"
import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export const metadata = {
    title: "Blog & News",
    description: "Latest news, articles, and insights from Landmark Christian University.",
}

export default async function BlogPage() {
    const supabase = await createClient()

    // Fetch published posts
    const { data: posts } = await supabase
        .from("posts")
        .select("*, author:profiles(first_name, last_name)")
        .eq("is_published", true)
        .order("published_at", { ascending: false })

    return (
        <div className="min-h-screen bg-gray-50">
            <SiteHeader />

            {/* Header */}
            <div className="bg-[#4a3472] py-20 text-center px-6">
                <h1 className="text-4xl font-bold text-white mb-4">News & Insights</h1>
                <p className="text-xl text-gray-200 max-w-2xl mx-auto">
                    Stay updated with the latest happenings, student stories, and theological reflections.
                </p>
            </div>

            {/* Posts Grid */}
            <div className="max-w-7xl mx-auto px-6 md:px-12 py-16">
                {posts && posts.length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {posts.map((post) => (
                            <Card key={post.id} className="overflow-hidden hover:shadow-xl transition-shadow flex flex-col h-full">
                                <div className="relative h-48 w-full bg-gray-200">
                                    {post.cover_image ? (
                                        <Image
                                            src={post.cover_image}
                                            alt={post.title}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-full items-center justify-center bg-gray-100 text-gray-400">
                                            No Image
                                        </div>
                                    )}
                                </div>
                                <CardHeader className="pb-2">
                                    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            {new Date(post.published_at!).toLocaleDateString()}
                                        </span>
                                        {post.author && (
                                            <span className="flex items-center gap-1">
                                                <User className="h-3 w-3" />
                                                {post.author.first_name} {post.author.last_name}
                                            </span>
                                        )}
                                    </div>
                                    <h2 className="text-xl font-bold text-[#4a3472] line-clamp-2">
                                        <Link href={`/blog/${post.slug}`} className="hover:underline">
                                            {post.title}
                                        </Link>
                                    </h2>
                                </CardHeader>
                                <CardContent className="flex-grow">
                                    <p className="text-gray-600 line-clamp-3">
                                        {post.excerpt}
                                    </p>
                                </CardContent>
                                <CardFooter className="pt-0">
                                    <Link href={`/blog/${post.slug}`} className="w-full">
                                        <Button variant="outline" className="w-full border-[#d4a843] text-[#d4a843] hover:bg-[#d4a843] hover:text-white">
                                            Read More
                                        </Button>
                                    </Link>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <p className="text-gray-500 text-lg">No posts found. Check back soon!</p>
                    </div>
                )}
            </div>

            <SiteFooter />
        </div>
    )
}
