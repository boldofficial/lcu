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
import { toast } from "sonner"
import { Loader2, Plus, Eye, EyeOff, Copy, Check, Shield } from "lucide-react"

const adminSchema = z.object({
    email: z.string().email("Invalid email address"),
    first_name: z.string().min(2, "First name is required"),
    last_name: z.string().min(2, "Last name is required"),
    phone: z.string().optional(),
    temp_password: z.string().min(8, "Password must be at least 8 characters"),
})

type AdminFormValues = z.infer<typeof adminSchema>

function generatePassword(length = 12) {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%"
    return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join("")
}

export function AddAdminModal() {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [copied, setCopied] = useState(false)
    const [createdCredentials, setCreatedCredentials] = useState<{ email: string; password: string } | null>(null)
    const router = useRouter()

    const form = useForm<AdminFormValues>({
        resolver: zodResolver(adminSchema),
        defaultValues: {
            email: "",
            first_name: "",
            last_name: "",
            phone: "",
            temp_password: generatePassword(),
        },
    })

    const regeneratePassword = () => {
        form.setValue("temp_password", generatePassword())
    }

    const copyCredentials = () => {
        if (createdCredentials) {
            navigator.clipboard.writeText(
                `Email: ${createdCredentials.email}\nPassword: ${createdCredentials.password}`
            )
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    async function onSubmit(data: AdminFormValues) {
        setLoading(true)
        try {
            const response = await fetch("/api/admin/admins", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || "Failed to create administrator")
            }

            // Store credentials to show to admin
            setCreatedCredentials({
                email: data.email,
                password: data.temp_password,
            })

            toast.success("Administrator created successfully!")
            router.refresh()
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to create administrator")
        } finally {
            setLoading(false)
        }
    }

    const handleClose = () => {
        setOpen(false)
        setCreatedCredentials(null)
        form.reset({
            email: "",
            first_name: "",
            last_name: "",
            phone: "",
            temp_password: generatePassword(),
        })
    }

    return (
        <Dialog open={open} onOpenChange={(isOpen) => isOpen ? setOpen(true) : handleClose()}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Administrator
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
                {createdCredentials ? (
                    <>
                        <DialogHeader>
                            <DialogTitle className="text-green-600 flex items-center gap-2">
                                <Shield className="h-5 w-5" />
                                Administrator Created!
                            </DialogTitle>
                            <DialogDescription>
                                Share these login credentials with the new administrator. They should change their password after first login.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="rounded-lg border bg-muted/50 p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-muted-foreground">Email:</span>
                                    <span className="font-mono text-sm">{createdCredentials.email}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-muted-foreground">Temporary Password:</span>
                                    <span className="font-mono text-sm">{createdCredentials.password}</span>
                                </div>
                            </div>
                            <Button onClick={copyCredentials} className="w-full" variant="outline">
                                {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                                {copied ? "Copied!" : "Copy Credentials"}
                            </Button>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleClose}>Done</Button>
                        </DialogFooter>
                    </>
                ) : (
                    <>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Shield className="h-5 w-5 text-primary" />
                                Add New Administrator
                            </DialogTitle>
                            <DialogDescription>
                                Create a new admin account with full access to the admin portal. Use this with caution.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="first_name">First Name</Label>
                                    <Input id="first_name" {...form.register("first_name")} placeholder="John" />
                                    {form.formState.errors.first_name && (
                                        <p className="text-sm text-destructive">{form.formState.errors.first_name.message}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="last_name">Last Name</Label>
                                    <Input id="last_name" {...form.register("last_name")} placeholder="Smith" />
                                    {form.formState.errors.last_name && (
                                        <p className="text-sm text-destructive">{form.formState.errors.last_name.message}</p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input id="email" type="email" {...form.register("email")} placeholder="admin@lcu.edu" />
                                {form.formState.errors.email && (
                                    <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="temp_password">Temporary Password</Label>
                                    <Button type="button" variant="ghost" size="sm" onClick={regeneratePassword}>
                                        Regenerate
                                    </Button>
                                </div>
                                <div className="relative">
                                    <Input
                                        id="temp_password"
                                        type={showPassword ? "text" : "password"}
                                        {...form.register("temp_password")}
                                        className="pr-10"
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="absolute right-0 top-0 h-full"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </Button>
                                </div>
                                {form.formState.errors.temp_password && (
                                    <p className="text-sm text-destructive">{form.formState.errors.temp_password.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone Number (Optional)</Label>
                                <Input id="phone" type="tel" {...form.register("phone")} placeholder="+1 (555) 123-4567" />
                            </div>

                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={handleClose}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={loading}>
                                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Create Admin
                                </Button>
                            </DialogFooter>
                        </form>
                    </>
                )}
            </DialogContent>
        </Dialog>
    )
}
