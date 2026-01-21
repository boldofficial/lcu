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
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

const facultySchema = z.object({
    first_name: z.string().min(2, "First name is required"),
    last_name: z.string().min(2, "Last name is required"),
    phone: z.string().optional(),
    bio: z.string().optional(),
    is_active: z.boolean(),
})

type FacultyFormValues = z.infer<typeof facultySchema>

interface Faculty {
    id: string
    email: string
    first_name: string
    last_name: string
    phone: string | null
    bio: string | null
    is_active: boolean
}

interface EditFacultyModalProps {
    faculty: Faculty | null
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess: () => void
}

export function EditFacultyModal({ faculty, open, onOpenChange, onSuccess }: EditFacultyModalProps) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const form = useForm<FacultyFormValues>({
        resolver: zodResolver(facultySchema),
        defaultValues: {
            first_name: "",
            last_name: "",
            phone: "",
            bio: "",
            is_active: true,
        },
    })

    useEffect(() => {
        if (faculty) {
            form.reset({
                first_name: faculty.first_name || "",
                last_name: faculty.last_name || "",
                phone: faculty.phone || "",
                bio: faculty.bio || "",
                is_active: faculty.is_active ?? true,
            })
        }
    }, [faculty, form])

    async function onSubmit(data: FacultyFormValues) {
        if (!faculty) return

        setLoading(true)
        try {
            const response = await fetch(`/api/admin/faculty/${faculty.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || "Failed to update faculty member")
            }

            toast.success("Faculty member updated successfully")
            onOpenChange(false)
            onSuccess()
            router.refresh()
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to update faculty member")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Edit Faculty Member</DialogTitle>
                    <DialogDescription>
                        Update information for {faculty?.first_name} {faculty?.last_name}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="first_name">First Name</Label>
                            <Input id="first_name" {...form.register("first_name")} />
                            {form.formState.errors.first_name && (
                                <p className="text-sm text-destructive">{form.formState.errors.first_name.message}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="last_name">Last Name</Label>
                            <Input id="last_name" {...form.register("last_name")} />
                            {form.formState.errors.last_name && (
                                <p className="text-sm text-destructive">{form.formState.errors.last_name.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input id="email" type="email" value={faculty?.email || ""} disabled className="bg-muted" />
                        <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input id="phone" type="tel" {...form.register("phone")} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea id="bio" {...form.register("bio")} rows={3} />
                    </div>

                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <Label>Active Status</Label>
                            <p className="text-sm text-muted-foreground">
                                Inactive faculty cannot access the portal
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
