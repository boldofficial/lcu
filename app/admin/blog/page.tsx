"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    PenLine,
    Plus,
    MoreHorizontal,
    Pencil,
    Trash2,
    Loader2,
    Eye,
    Calendar
} from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { toast } from "sonner"

interface Post {
    id: string
    slug: string
    title: string
    excerpt: string | null
    is_published: boolean
    published_at: string | null
    created_at: string
    author?: {
        first_name: string | null
        last_name: string | null
    }
}

export default function AdminBlogPage() {
    const [posts, setPosts] = useState<Post[]>([])
    const [loading, setLoading] = useState(true)
    const [deleting, setDeleting] = useState<string | null>(null)

    useEffect(() => {
        fetchPosts()
    }, [])

    async function fetchPosts() {
        const supabase = createClient()
        const { data } = await supabase
            .from("posts")
            .select(`
                *,
                author:profiles(first_name, last_name)
            `)
            .order("created_at", { ascending: false })

        setPosts(data || [])
        setLoading(false)
    }

    async function deletePost(id: string) {
        if (!confirm("Are you sure you want to delete this post?")) return

        setDeleting(id)
        const supabase = createClient()
        const { error } = await supabase
            .from("posts")
            .delete()
            .eq("id", id)

        if (error) {
            toast.error("Failed to delete post")
        } else {
            toast.success("Post deleted successfully")
            setPosts(posts.filter(p => p.id !== id))
        }
        setDeleting(null)
    }

    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Blog Management</h1>
                    <p className="text-muted-foreground">Create and manage blog posts</p>
                </div>
                <Link href="/admin/blog/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        New Post
                    </Button>
                </Link>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Posts</CardTitle>
                </CardHeader>
                <CardContent>
                    {posts.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Author</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Published</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {posts.map((post) => (
                                    <TableRow key={post.id}>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium">{post.title}</p>
                                                <p className="text-xs text-muted-foreground">/blog/{post.slug}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {post.author
                                                ? `${post.author.first_name || ''} ${post.author.last_name || ''}`.trim() || 'Unknown'
                                                : 'Unknown'
                                            }
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={post.is_published ? "default" : "secondary"}>
                                                {post.is_published ? "Published" : "Draft"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {post.published_at
                                                ? new Date(post.published_at).toLocaleDateString()
                                                : '-'
                                            }
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/blog/${post.slug}`} target="_blank">
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            View
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/admin/blog/${post.id}/edit`}>
                                                            <Pencil className="mr-2 h-4 w-4" />
                                                            Edit
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="text-destructive"
                                                        onClick={() => deletePost(post.id)}
                                                        disabled={deleting === post.id}
                                                    >
                                                        {deleting === post.id ? (
                                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                        ) : (
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                        )}
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="flex h-48 items-center justify-center text-muted-foreground">
                            No posts found. Create your first post to get started.
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
