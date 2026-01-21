"use client"

import { useState } from "react"
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

const programSchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters"),
    code: z.string().min(2, "Code is required"),
    description: z.string().optional(),
    degree_type: z.enum(["certificate", "associate", "bachelor", "master", "doctorate"]),
    department: z.string().min(2, "Department is required"),
    total_credits: z.coerce.number().min(1, "Credits must be at least 1"),
    duration_months: z.coerce.number().min(1, "Duration must be at least 1 month"),
    tuition_amount: z.coerce.number().min(0, "Tuition must be positive"),
    application_fee: z.coerce.number().min(0, "Application fee must be positive"),
    cover_image: z.string().optional(),
})

type ProgramFormValues = z.infer<typeof programSchema>

export function AddProgramModal() {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const form = useForm<ProgramFormValues>({
        resolver: zodResolver(programSchema),
        defaultValues: {
            name: "",
            code: "",
            description: "",
            degree_type: "bachelor",
            department: "Theology",
            total_credits: 120,
            duration_months: 48,
            tuition_amount: 15000,
            application_fee: 50,
            cover_image: "",
        },
    })

    async function onSubmit(data: ProgramFormValues) {
        setLoading(true)
        try {
            const response = await fetch("/api/admin/programs", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || "Failed to create program")
            }

            toast.success("Program created successfully")
            setOpen(false)
            form.reset()
            router.refresh()
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to create program")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Program
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Add New Program</DialogTitle>
                    <DialogDescription>
                        Create a new degree program or certificate.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="name">Program Name</Label>
                            <Input id="name" {...form.register("name")} placeholder="Bachelor of Theology" />
                            {form.formState.errors.name && (
                                <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="code">Code</Label>
                            <Input id="code" {...form.register("code")} placeholder="BA-THEO" />
                            {form.formState.errors.code && (
                                <p className="text-sm text-destructive">{form.formState.errors.code.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label>Degree Type</Label>
                            <Select
                                value={form.watch("degree_type")}
                                onValueChange={(value) => form.setValue("degree_type", value as any)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="certificate">Certificate</SelectItem>
                                    <SelectItem value="associate">Associate</SelectItem>
                                    <SelectItem value="bachelor">Bachelor</SelectItem>
                                    <SelectItem value="master">Master</SelectItem>
                                    <SelectItem value="doctorate">Doctorate</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="department">Department</Label>
                            <Input id="department" {...form.register("department")} placeholder="Theology" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            {...form.register("description")}
                            placeholder="Program description..."
                            rows={3}
                        />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="total_credits">Total Credits</Label>
                            <Input
                                id="total_credits"
                                type="number"
                                {...form.register("total_credits")}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="duration_months">Duration (months)</Label>
                            <Input
                                id="duration_months"
                                type="number"
                                {...form.register("duration_months")}
                            />
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="tuition_amount">Tuition Fee ($)</Label>
                            <Input
                                id="tuition_amount"
                                type="number"
                                {...form.register("tuition_amount")}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="application_fee">Application Fee ($)</Label>
                            <Input
                                id="application_fee"
                                type="number"
                                {...form.register("application_fee")}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="cover_image">Cover Image URL</Label>
                        <Input
                            id="cover_image"
                            {...form.register("cover_image")}
                            placeholder="https://example.com/image.jpg or /images/program.png"
                        />
                        <p className="text-xs text-muted-foreground">
                            Enter a URL for the program cover image. Leave blank to use default.
                        </p>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create Program
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
