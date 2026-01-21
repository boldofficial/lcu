"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

const courseSchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters"),
    code: z.string().min(2, "Code is required"),
    description: z.string().optional(),
    program_id: z.string().uuid("Please select a program"),
    credits: z.coerce.number().min(1, "Credits must be at least 1"),
    duration_weeks: z.coerce.number().min(1, "Duration must be at least 1 week"),
    instructor_id: z.string().optional().nullable(),
    is_active: z.boolean(),
})

type CourseFormValues = z.infer<typeof courseSchema>

interface Course {
    id: string
    name: string
    code: string
    description: string | null
    program_id: string | null
    credits: number
    duration_weeks: number
    instructor_id: string | null
    is_active: boolean
    program?: { id: string; name: string }
    instructor?: { id: string; first_name: string; last_name: string }
}

interface Program {
    id: string
    name: string
}

interface Faculty {
    id: string
    first_name: string
    last_name: string
}

interface EditCourseModalProps {
    course: Course | null
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess: () => void
}

export function EditCourseModal({ course, open, onOpenChange, onSuccess }: EditCourseModalProps) {
    const [loading, setLoading] = useState(false)
    const [programs, setPrograms] = useState<Program[]>([])
    const [faculty, setFaculty] = useState<Faculty[]>([])
    const router = useRouter()

    const form = useForm<CourseFormValues>({
        resolver: zodResolver(courseSchema),
        defaultValues: {
            name: "",
            code: "",
            description: "",
            program_id: "",
            credits: 3,
            duration_weeks: 8,
            instructor_id: null,
            is_active: true,
        },
    })

    useEffect(() => {
        if (open) {
            // Fetch programs
            fetch("/api/admin/programs")
                .then((res) => res.json())
                .then((data) => setPrograms(data || []))
                .catch(() => toast.error("Failed to load programs"))

            // Fetch faculty
            fetch("/api/admin/faculty")
                .then((res) => res.json())
                .then((data) => setFaculty(data || []))
                .catch(() => toast.error("Failed to load faculty"))
        }
    }, [open])

    useEffect(() => {
        if (course) {
            form.reset({
                name: course.name || "",
                code: course.code || "",
                description: course.description || "",
                program_id: course.program_id || course.program?.id || "",
                credits: course.credits || 3,
                duration_weeks: course.duration_weeks || 8,
                instructor_id: course.instructor_id || course.instructor?.id || null,
                is_active: course.is_active ?? true,
            })
        }
    }, [course, form])

    async function onSubmit(data: CourseFormValues) {
        if (!course) return

        setLoading(true)
        try {
            const response = await fetch(`/api/admin/courses/${course.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...data,
                    instructor_id: data.instructor_id === "none" ? null : data.instructor_id,
                }),
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || "Failed to update course")
            }

            toast.success("Course updated successfully")
            onOpenChange(false)
            onSuccess()
            router.refresh()
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to update course")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Edit Course</DialogTitle>
                    <DialogDescription>
                        Update course details for {course?.code} - {course?.name}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="name">Course Name</Label>
                            <Input id="name" {...form.register("name")} />
                            {form.formState.errors.name && (
                                <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="code">Course Code</Label>
                            <Input id="code" {...form.register("code")} />
                            {form.formState.errors.code && (
                                <p className="text-sm text-destructive">{form.formState.errors.code.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Program</Label>
                        <Select
                            value={form.watch("program_id")}
                            onValueChange={(value) => form.setValue("program_id", value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select a program" />
                            </SelectTrigger>
                            <SelectContent>
                                {programs.map((program) => (
                                    <SelectItem key={program.id} value={program.id}>
                                        {program.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {form.formState.errors.program_id && (
                            <p className="text-sm text-destructive">{form.formState.errors.program_id.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label>Instructor</Label>
                        <Select
                            value={form.watch("instructor_id") || "none"}
                            onValueChange={(value) => form.setValue("instructor_id", value === "none" ? null : value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Assign an instructor" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">No instructor</SelectItem>
                                {faculty.map((member) => (
                                    <SelectItem key={member.id} value={member.id}>
                                        {member.first_name} {member.last_name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" {...form.register("description")} rows={3} />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="credits">Credits</Label>
                            <Input id="credits" type="number" {...form.register("credits")} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="duration_weeks">Duration (weeks)</Label>
                            <Input id="duration_weeks" type="number" {...form.register("duration_weeks")} />
                        </div>
                    </div>

                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <Label>Active Status</Label>
                            <p className="text-sm text-muted-foreground">
                                Inactive courses are hidden from students
                            </p>
                        </div>
                        <Switch
                            checked={form.watch("is_active")}
                            onCheckedChange={(checked) => form.setValue("is_active", checked)}
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Changes
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
