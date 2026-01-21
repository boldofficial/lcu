import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { SocialShare } from "@/components/social-share"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Calendar, User } from "lucide-react"
import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export const metadata = {
    title: "Blog Post",
}

export default async function BlogPostPage({
    params,
}: {
    params: Promise<{ slug: string }>
}) {
    const { slug } = await params
    const supabase = await createClient()

    const { data: post, error } = await supabase
        .from("posts")
        .select("*, author:profiles(first_name, last_name, avatar_url, bio)")
        .eq("slug", slug)
        .eq("is_published", true)
        .single()

    if (error || !post) {
        notFound()
    }

    return (
        <div className="min-h-screen bg-white">
            <SiteHeader />

            <article className="pb-20">
                {/* Hero / Cover */}
                <div className="relative w-full h-[400px] md:h-[500px] bg-gray-900">
                    {post.cover_image && (
                        <Image
                            src={post.cover_image}
                            alt={post.title}
                            fill
                            className="object-cover opacity-60"
                            priority
                        />
                    )}
                    <div className="absolute inset-0 flex items-end">
                        <div className="container mx-auto px-6 md:px-12 pb-12 md:pb-20">
                            <Link
                                href="/blog"
                                className="inline-flex items-center text-gray-300 hover:text-white mb-6 transition-colors"
                            >
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Blog
                            </Link>
                            <h1 className="text-3xl md:text-5xl font-bold text-white mb-6 max-w-4xl leading-tight">
                                {post.title}
                            </h1>
                            <div className="flex flex-wrap items-center gap-6 text-gray-200">
                                <div className="flex items-center gap-2">
                                    <div className="h-10 w-10 rounded-full bg-[#d4a843] flex items-center justify-center text-white font-bold overflow-hidden">
                                        {post.author?.avatar_url ? (
                                            <Image src={post.author.avatar_url} alt="Author" width={40} height={40} />
                                        ) : (
                                            <User className="h-5 w-5" />
                                        )}
                                    </div>
                                    <span className="font-medium">
                                        {post.author ? `${post.author.first_name} ${post.author.last_name}` : "Unknown Author"}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5 text-[#d4a843]" />
                                    <span>{new Date(post.published_at!).toLocaleDateString(undefined, {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="max-w-4xl mx-auto px-6 md:px-12 py-12">
                    {/* Breadcrumbs */}
                    <div className="mb-8">
                        <Breadcrumbs items={[
                            { label: "Blog", href: "/blog" },
                            { label: post.title }
                        ]} />
                    </div>

                    {/* Social Share */}
                    <div className="mb-8 pb-8 border-b">
                        <SocialShare
                            url={`${process.env.NEXT_PUBLIC_SITE_URL || 'https://landmarkchristian.edu'}/blog/${slug}`}
                            title={post.title}
                            description={post.excerpt || ''}
                        />
                    </div>

                    <div className="prose prose-lg prose-purple max-w-none">
                        {/* Note: In production, sanitize HTML with DOMPurify */}
                        <div dangerouslySetInnerHTML={{ __html: post.content || "" }} />

                        {!post.content && (
                            <p className="text-gray-500 italic">No content available.</p>
                        )}
                    </div>

                    {/* Author Bio (Optional) */}
                    {post.author && post.author.bio && (
                        <div className="mt-16 p-8 bg-gray-50 rounded-2xl border flex gap-6 items-start">
                            <div className="h-16 w-16 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden relative">
                                {post.author.avatar_url ? (
                                    <Image src={post.author.avatar_url} alt="Author" fill className="object-cover" />
                                ) : (
                                    <User className="h-8 w-8 m-auto text-gray-400" />
                                )}
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-[#4a3472] mb-2">About the Author</h3>
                                <p className="text-gray-600">{post.author.bio}</p>
                            </div>
                        </div>
                    )}
                </div>
            </article>

            <SiteFooter />
        </div>
    )
}
