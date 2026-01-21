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
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { Loader2, Plus } from "lucide-react"

const courseSchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters"),
    code: z.string().min(2, "Code is required"),
    description: z.string().optional(),
    program_id: z.string().uuid("Please select a program"),
    credits: z.coerce.number().min(1, "Credits must be at least 1"),
    duration_weeks: z.coerce.number().min(1, "Duration must be at least 1 week"),
    instructor_id: z.string().optional().nullable(),
})

type CourseFormValues = z.infer<typeof courseSchema>

interface Program {
    id: string
    name: string
}

interface Faculty {
    id: string
    first_name: string
    last_name: string
}

export function AddCourseModal() {
    const [open, setOpen] = useState(false)
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

    async function onSubmit(data: CourseFormValues) {
        setLoading(true)
        try {
            const response = await fetch("/api/admin/courses", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...data,
                    instructor_id: data.instructor_id || null,
                }),
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || "Failed to create course")
            }

            toast.success("Course created successfully")
            setOpen(false)
            form.reset()
            router.refresh()
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to create course")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Course
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Add New Course</DialogTitle>
                    <DialogDescription>
                        Create a new course and assign it to a program.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="name">Course Name</Label>
                            <Input id="name" {...form.register("name")} placeholder="Introduction to Theology" />
                            {form.formState.errors.name && (
                                <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="code">Course Code</Label>
                            <Input id="code" {...form.register("code")} placeholder="THEO-101" />
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
                        <Label>Instructor (Optional)</Label>
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
                        <Textarea
                            id="description"
                            {...form.register("description")}
                            placeholder="Course description..."
                            rows={3}
                        />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="credits">Credits</Label>
                            <Input
                                id="credits"
                                type="number"
                                {...form.register("credits")}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="duration_weeks">Duration (weeks)</Label>
                            <Input
                                id="duration_weeks"
                                type="number"
                                {...form.register("duration_weeks")}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create Course
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
