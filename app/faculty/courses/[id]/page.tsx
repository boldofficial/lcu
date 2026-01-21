"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { use } from "react"
import { createClient } from "@/lib/supabase/client"
import { DashboardHeader } from "@/components/dashboard/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    BookOpen,
    Users,
    Clock,
    Plus,
    GripVertical,
    Pencil,
    Trash2,
    Eye,
    EyeOff,
    ChevronRight,
    Loader2,
    Video,
    FileText,
    ArrowLeft,
} from "lucide-react"
import { toast } from "sonner"

interface Module {
    id: string
    title: string
    description: string
    order_index: number
    is_published: boolean
    lessons?: { id: string }[]
}

interface Course {
    id: string
    name: string
    code: string
    description: string
    credits: number
    duration_weeks: number
    is_active: boolean
    program?: { name: string; code: string }
    modules?: Module[]
    course_enrollments?: { id: string }[]
}

export default function FacultyCourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const [course, setCourse] = useState<Course | null>(null)
    const [loading, setLoading] = useState(true)
    const [addModuleOpen, setAddModuleOpen] = useState(false)
    const [newModuleTitle, setNewModuleTitle] = useState("")
    const [newModuleDescription, setNewModuleDescription] = useState("")
    const [submitting, setSubmitting] = useState(false)
    const router = useRouter()

    useEffect(() => {
        fetchCourse()
    }, [id])

    async function fetchCourse() {
        const supabase = createClient()
        const { data, error } = await supabase
            .from("courses")
            .select(`
        *,
        program:programs(name, code),
        modules(id, title, description, order_index, is_published, lessons(id)),
        course_enrollments(id)
      `)
            .eq("id", id)
            .single()

        if (error) {
            toast.error("Failed to load course")
            return
        }

        // Sort modules by order_index
        if (data?.modules) {
            data.modules.sort((a: Module, b: Module) => a.order_index - b.order_index)
        }

        setCourse(data)
        setLoading(false)
    }

    async function handleAddModule() {
        if (!newModuleTitle.trim()) {
            toast.error("Module title is required")
            return
        }

        setSubmitting(true)
        const supabase = createClient()

        const maxOrder = course?.modules?.reduce((max, m) => Math.max(max, m.order_index), -1) ?? -1

        const { error } = await supabase
            .from("modules")
            .insert({
                course_id: id,
                title: newModuleTitle,
                description: newModuleDescription,
                order_index: maxOrder + 1,
                is_published: false,
            })

        if (error) {
            toast.error("Failed to create module")
        } else {
            toast.success("Module created!")
            setAddModuleOpen(false)
            setNewModuleTitle("")
            setNewModuleDescription("")
            fetchCourse()
        }
        setSubmitting(false)
    }

    async function toggleModulePublish(moduleId: string, currentStatus: boolean) {
        const supabase = createClient()
        const { error } = await supabase
            .from("modules")
            .update({ is_published: !currentStatus })
            .eq("id", moduleId)

        if (error) {
            toast.error("Failed to update module")
        } else {
            toast.success(currentStatus ? "Module unpublished" : "Module published")
            fetchCourse()
        }
    }

    async function deleteModule(moduleId: string) {
        if (!confirm("Are you sure you want to delete this module and all its lessons?")) return

        const supabase = createClient()
        const { error } = await supabase.from("modules").delete().eq("id", moduleId)

        if (error) {
            toast.error("Failed to delete module")
        } else {
            toast.success("Module deleted")
            fetchCourse()
        }
    }

    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (!course) {
        return (
            <div className="flex h-96 flex-col items-center justify-center">
                <p className="text-muted-foreground">Course not found</p>
                <Link href="/faculty/courses">
                    <Button variant="link">Back to courses</Button>
                </Link>
            </div>
        )
    }

    return (
        <div className="flex flex-col">
            <DashboardHeader title={course.name} />

            <div className="flex-1 space-y-6 p-6">
                {/* Back button and header */}
                <div className="flex items-center gap-4">
                    <Link href="/faculty/courses">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <Badge variant="outline">{course.code}</Badge>
                            <Badge variant={course.is_active ? "default" : "secondary"}>
                                {course.is_active ? "Active" : "Inactive"}
                            </Badge>
                        </div>
                        <h1 className="text-2xl font-bold">{course.name}</h1>
                        <p className="text-muted-foreground">{course.program?.name}</p>
                    </div>
                </div>

                {/* Course Stats */}
                <div className="grid gap-4 sm:grid-cols-4">
                    <Card>
                        <CardContent className="flex items-center gap-4 p-4">
                            <BookOpen className="h-8 w-8 text-primary" />
                            <div>
                                <p className="text-2xl font-bold">{course.modules?.length || 0}</p>
                                <p className="text-sm text-muted-foreground">Modules</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="flex items-center gap-4 p-4">
                            <FileText className="h-8 w-8 text-primary" />
                            <div>
                                <p className="text-2xl font-bold">
                                    {course.modules?.reduce((sum, m) => sum + (m.lessons?.length || 0), 0) || 0}
                                </p>
                                <p className="text-sm text-muted-foreground">Lessons</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="flex items-center gap-4 p-4">
                            <Users className="h-8 w-8 text-primary" />
                            <div>
                                <p className="text-2xl font-bold">{course.course_enrollments?.length || 0}</p>
                                <p className="text-sm text-muted-foreground">Students</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="flex items-center gap-4 p-4">
                            <Clock className="h-8 w-8 text-primary" />
                            <div>
                                <p className="text-2xl font-bold">{course.duration_weeks}</p>
                                <p className="text-sm text-muted-foreground">Weeks</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Modules Section */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Course Modules</CardTitle>
                                <CardDescription>Organize your course content into modules and lessons</CardDescription>
                            </div>
                            <Dialog open={addModuleOpen} onOpenChange={setAddModuleOpen}>
                                <DialogTrigger asChild>
                                    <Button>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add Module
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Add New Module</DialogTitle>
                                        <DialogDescription>Create a new module for this course</DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="module-title">Module Title</Label>
                                            <Input
                                                id="module-title"
                                                placeholder="e.g., Introduction to the Course"
                                                value={newModuleTitle}
                                                onChange={(e) => setNewModuleTitle(e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="module-description">Description (Optional)</Label>
                                            <Textarea
                                                id="module-description"
                                                placeholder="Brief description of this module..."
                                                value={newModuleDescription}
                                                onChange={(e) => setNewModuleDescription(e.target.value)}
                                                rows={3}
                                            />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button variant="outline" onClick={() => setAddModuleOpen(false)}>
                                            Cancel
                                        </Button>
                                        <Button onClick={handleAddModule} disabled={submitting}>
                                            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            Create Module
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {course.modules && course.modules.length > 0 ? (
                            <div className="space-y-3">
                                {course.modules.map((module, index) => (
                                    <div
                                        key={module.id}
                                        className="flex items-center gap-4 rounded-lg border p-4 hover:bg-muted/50 transition-colors"
                                    >
                                        <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium text-muted-foreground">
                                                    Module {index + 1}
                                                </span>
                                                <Badge variant={module.is_published ? "default" : "secondary"} className="text-xs">
                                                    {module.is_published ? "Published" : "Draft"}
                                                </Badge>
                                            </div>
                                            <h4 className="font-semibold truncate">{module.title}</h4>
                                            {module.description && (
                                                <p className="text-sm text-muted-foreground line-clamp-1">{module.description}</p>
                                            )}
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {module.lessons?.length || 0} lessons
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => toggleModulePublish(module.id, module.is_published)}
                                                title={module.is_published ? "Unpublish" : "Publish"}
                                            >
                                                {module.is_published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </Button>
                                            <Link href={`/faculty/courses/${id}/modules/${module.id}`}>
                                                <Button variant="ghost" size="icon" title="Edit module">
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => deleteModule(module.id)}
                                                className="text-destructive hover:text-destructive"
                                                title="Delete module"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                            <Link href={`/faculty/courses/${id}/modules/${module.id}`}>
                                                <Button variant="outline" size="sm">
                                                    Manage Lessons
                                                    <ChevronRight className="ml-1 h-4 w-4" />
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <BookOpen className="mb-4 h-12 w-12 text-muted-foreground/50" />
                                <p className="text-muted-foreground">No modules yet</p>
                                <p className="text-sm text-muted-foreground">Create your first module to start adding content</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
