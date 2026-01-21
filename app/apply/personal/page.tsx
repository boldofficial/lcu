"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ApplicationProgress } from "@/components/apply/application-progress"
import { useApplication } from "@/components/apply/application-context"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

const personalInfoSchema = z.object({
    first_name: z.string().min(2, "First name must be at least 2 characters"),
    last_name: z.string().min(2, "Last name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    phone: z.string().min(10, "Please enter a valid phone number"),
    date_of_birth: z.string().refine((date) => new Date(date) < new Date(), {
        message: "Date of birth must be in the past",
    }),
    address: z.string().min(5, "Address must be at least 5 characters"),
    city: z.string().min(2, "City must be at least 2 characters"),
    state: z.string().min(2, "State must be at least 2 characters"),
    zip_code: z.string().min(5, "Zip code must be at least 5 characters"),
    country: z.string().min(2, "Country is required"),
    password: z.string().optional(),
})

type PersonalInfoForm = z.infer<typeof personalInfoSchema>

export default function PersonalInfoPage() {
    const router = useRouter()
    const { formData, updateFormData, setCurrentStep, setApplicationId } = useApplication()
    const [loading, setLoading] = useState(false)

    // Auth state
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [authChecking, setAuthChecking] = useState(true)

    useEffect(() => {
        setCurrentStep(2)
        checkAuth()
    }, [setCurrentStep])

    async function checkAuth() {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (user) {
            setIsAuthenticated(true)
            // Pre-fill email if not set
            if (!formData.email) {
                updateFormData({ email: user.email })
                form.setValue("email", user.email || "")
            }
        } else {
            setIsAuthenticated(false)
            // Guest mode: User will need to provide password to sign up
        }
        setAuthChecking(false)
    }

    const form = useForm<PersonalInfoForm>({
        resolver: zodResolver(personalInfoSchema),
        defaultValues: {
            first_name: formData.first_name || "",
            last_name: formData.last_name || "",
            email: formData.email || "",
            phone: formData.phone || "",
            date_of_birth: formData.date_of_birth || "",
            address: formData.address || "",
            city: formData.city || "",
            state: formData.state || "",
            zip_code: formData.zip_code || "",
            country: formData.country || "",
        },
    })

    useEffect(() => {
        if (!formData.program_id && !authChecking) {
            toast.error("Please select a program first")
            router.push("/apply")
        }
    }, [formData.program_id, authChecking, router])


    async function onSubmit(data: PersonalInfoForm) {
        let isNowAuthenticated = isAuthenticated

        if (!isAuthenticated) {
            if (!data.password || data.password.length < 6) {
                form.setError("password", { message: "Password must be at least 6 characters" })
                toast.error("Please create a password to save your application")
                return
            }

            setLoading(true)
            const supabase = createClient()

            // 1. Sign up the user
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: data.email,
                password: data.password,
                options: {
                    data: {
                        first_name: data.first_name,
                        last_name: data.last_name,
                        phone: data.phone,
                        role: "student"
                    }
                }
            })

            if (authError) {
                setLoading(false)
                toast.error(authError.message)
                return
            }

            if (authData.user) {
                // If we have a user/session, we can proceed
                isNowAuthenticated = true
                // Note: If email confirmation is enabled, the session might be null.
                // In that case, we should probably tell them to check email.
                if (!authData.session) {
                    setLoading(false)
                    toast.success("Account created! Please check your email to confirm your account, then log in to continue.")
                    // Redirect to login or stay here?
                    router.push("/auth/login")
                    return
                }
            }
        }

        setLoading(true)

        // Save to database
        // Ideally we create the application record here

        try {
            const supabase = createClient()
            // Check if application already exists (maybe in context we have ID?)
            // If not, create it using API

            const response = await fetch("/api/applications", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ program_id: formData.program_id }),
            })

            if (!response.ok) {
                throw new Error("Failed to create application")
            }

            const application = await response.json()

            // Now update with personal details
            // We can use the PATCH endpoint

            const updateResponse = await fetch(`/api/applications/${application.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    applicant_first_name: data.first_name,
                    applicant_last_name: data.last_name,
                    applicant_phone: data.phone,
                    applicant_date_of_birth: data.date_of_birth,
                    applicant_address: data.address,
                    applicant_city: data.city,
                    applicant_state: data.state,
                    applicant_zip_code: data.zip_code,
                    applicant_country: data.country
                })
            })

            if (!updateResponse.ok) {
                throw new Error("Failed to save personal details")
            }

            const updatedApp = await updateResponse.json()

            updateFormData(data)
            setApplicationId(updatedApp.id)

            router.push("/apply/education")
        } catch (error) {
            toast.error("Failed to save application. Please try again.")
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    if (authChecking) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="mx-auto max-w-2xl space-y-8">
            <ApplicationProgress currentStep={2} />

            <Card>
                <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>
                        Tell us a bit about yourself.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" {...form.register("email")} disabled={isAuthenticated} />
                            {form.formState.errors.email && (
                                <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
                            )}
                        </div>

                        {!isAuthenticated && (
                            <div className="space-y-2">
                                <Label htmlFor="password">Create Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="Create a password for your account"
                                    {...form.register("password")}
                                />
                                {form.formState.errors.password && (
                                    <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
                                )}
                                <p className="text-xs text-muted-foreground">
                                    You will use this to log in and check your application status.
                                </p>
                            </div>
                        )}

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                <Input id="phone" type="tel" {...form.register("phone")} />
                                {form.formState.errors.phone && (
                                    <p className="text-sm text-destructive">{form.formState.errors.phone.message}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="date_of_birth">Date of Birth</Label>
                                <Input id="date_of_birth" type="date" {...form.register("date_of_birth")} />
                                {form.formState.errors.date_of_birth && (
                                    <p className="text-sm text-destructive">{form.formState.errors.date_of_birth.message}</p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="address">Address</Label>
                            <Input id="address" {...form.register("address")} />
                            {form.formState.errors.address && (
                                <p className="text-sm text-destructive">{form.formState.errors.address.message}</p>
                            )}
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="city">City</Label>
                                <Input id="city" {...form.register("city")} />
                                {form.formState.errors.city && (
                                    <p className="text-sm text-destructive">{form.formState.errors.city.message}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="state">State / Province</Label>
                                <Input id="state" {...form.register("state")} />
                                {form.formState.errors.state && (
                                    <p className="text-sm text-destructive">{form.formState.errors.state.message}</p>
                                )}
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="zip_code">Zip / Postal Code</Label>
                                <Input id="zip_code" {...form.register("zip_code")} />
                                {form.formState.errors.zip_code && (
                                    <p className="text-sm text-destructive">{form.formState.errors.zip_code.message}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="country">Country</Label>
                                <Select
                                    onValueChange={(value) => form.setValue("country", value)}
                                    defaultValue={form.getValues("country")}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select country" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="US">United States</SelectItem>
                                        <SelectItem value="CA">Canada</SelectItem>
                                        <SelectItem value="GB">United Kingdom</SelectItem>
                                        <SelectItem value="AU">Australia</SelectItem>
                                        <SelectItem value="NG">Nigeria</SelectItem>
                                        <SelectItem value="Other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                                {form.formState.errors.country && (
                                    <p className="text-sm text-destructive">{form.formState.errors.country.message}</p>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-between pt-4">
                            <Button type="button" variant="outline" onClick={() => router.push("/apply")}>
                                Back
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Continue
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
