"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { use } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import { ImageUpload } from "@/components/ui/image-upload"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { ArrowLeft, Loader2, Save } from "lucide-react"

const postSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    slug: z.string().min(3, "Slug must be at least 3 characters").regex(/^[a-z0-9-]+$/, "Slug must be lowercase with hyphens only"),
    excerpt: z.string().optional(),
    content: z.string().optional(),
    cover_image: z.string().optional(),
    is_published: z.boolean().default(false),
})

type PostFormValues = z.infer<typeof postSchema>

export default function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(true)
    const router = useRouter()

    const form = useForm<PostFormValues>({
        resolver: zodResolver(postSchema),
        defaultValues: {
            title: "",
            slug: "",
            excerpt: "",
            content: "",
            cover_image: "",
            is_published: false,
        },
    })

    useEffect(() => {
        async function fetchPost() {
            const supabase = createClient()
            const { data, error } = await supabase
                .from("posts")
                .select("*")
                .eq("id", id)
                .single()

            if (error || !data) {
                toast.error("Post not found")
                router.push("/admin/blog")
                return
            }

            form.reset({
                title: data.title,
                slug: data.slug,
                excerpt: data.excerpt || "",
                content: data.content || "",
                cover_image: data.cover_image || "",
                is_published: data.is_published,
            })
            setFetching(false)
        }

        fetchPost()
    }, [id, form, router])

    async function onSubmit(data: PostFormValues) {
        setLoading(true)
        try {
            const supabase = createClient()

            const updateData = {
                ...data,
                published_at: data.is_published ? new Date().toISOString() : null,
            }

            const { error } = await supabase
                .from("posts")
                .update(updateData)
                .eq("id", id)

            if (error) {
                if (error.code === '23505') {
                    toast.error("A post with this slug already exists")
                } else {
                    toast.error("Failed to update post")
                }
                console.error(error)
                return
            }

            toast.success("Post updated successfully")
            router.push("/admin/blog")
        } catch (error) {
            toast.error("An error occurred")
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    if (fetching) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/admin/blog">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Edit Post</h1>
                    <p className="text-muted-foreground">Update blog article</p>
                </div>
            </div>

            <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Post Content</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Title</Label>
                                    <Input
                                        id="title"
                                        {...form.register("title")}
                                        placeholder="Enter post title"
                                    />
                                    {form.formState.errors.title && (
                                        <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="slug">URL Slug</Label>
                                    <Input
                                        id="slug"
                                        {...form.register("slug")}
                                        placeholder="my-blog-post"
                                    />
                                    {form.formState.errors.slug && (
                                        <p className="text-sm text-destructive">{form.formState.errors.slug.message}</p>
                                    )}
                                    <p className="text-xs text-muted-foreground">
                                        URL: /blog/{form.watch("slug") || "your-slug"}
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="excerpt">Excerpt</Label>
                                    <Textarea
                                        id="excerpt"
                                        {...form.register("excerpt")}
                                        placeholder="A brief summary of the post..."
                                        rows={3}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="content">Content (HTML)</Label>
                                    <RichTextEditor
                                        value={form.watch("content") || ""}
                                        onChange={(value) => form.setValue("content", value, { shouldValidate: true })}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Publishing</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="is_published">Published</Label>
                                    <Switch
                                        id="is_published"
                                        checked={form.watch("is_published")}
                                        onCheckedChange={(checked) => form.setValue("is_published", checked)}
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {form.watch("is_published")
                                        ? "Post is visible on the public blog."
                                        : "Post is saved as a draft."
                                    }
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Cover Image</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Label htmlFor="cover_image">Cover Image</Label>
                                <ImageUpload
                                    value={form.watch("cover_image")}
                                    onChange={(url) => form.setValue("cover_image", url, { shouldValidate: true })}
                                />
                                {form.watch("cover_image") && (
                                    <div className="aspect-video rounded-lg border overflow-hidden bg-gray-100">
                                        <img
                                            src={form.watch("cover_image")}
                                            alt="Cover preview"
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).style.display = 'none'
                                            }}
                                        />
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            <Save className="mr-2 h-4 w-4" />
                            Update Post
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    )
}
