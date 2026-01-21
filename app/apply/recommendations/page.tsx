"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ApplicationProgress } from "@/components/apply/application-progress"
import { useApplication } from "@/components/apply/application-context"
import { ChevronLeft, ChevronRight, Mail, Plus, Trash2, Clock, CheckCircle, AlertCircle } from "lucide-react"

const recommendationSchema = z.object({
    name: z.string().min(2, "Name is required"),
    email: z.string().email("Please enter a valid email"),
    title: z.string().optional(),
    relationship: z.string().min(2, "Please describe your relationship"),
})

type RecommendationForm = z.infer<typeof recommendationSchema>

interface Recommender {
    id: string
    name: string
    email: string
    title?: string
    relationship: string
    status: "pending" | "sent" | "submitted"
}

export default function RecommendationsPage() {
    const router = useRouter()
    const { setCurrentStep } = useApplication()
    const [recommenders, setRecommenders] = useState<Recommender[]>([])
    const [showForm, setShowForm] = useState(false)

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<RecommendationForm>({
        resolver: zodResolver(recommendationSchema),
    })

    useEffect(() => {
        setCurrentStep(6)
    }, [setCurrentStep])

    function onAddRecommender(data: RecommendationForm) {
        const newRecommender: Recommender = {
            id: crypto.randomUUID(),
            ...data,
            status: "pending",
        }
        setRecommenders((prev) => [...prev, newRecommender])
        reset()
        setShowForm(false)
    }

    function handleRemoveRecommender(id: string) {
        setRecommenders((prev) => prev.filter((r) => r.id !== id))
    }

    function handleSendRequest(id: string) {
        setRecommenders((prev) =>
            prev.map((r) => (r.id === id ? { ...r, status: "sent" as const } : r))
        )
        // TODO: Actually send email via API
    }

    const statusConfig = {
        pending: { icon: Clock, label: "Not Sent", color: "text-muted-foreground" },
        sent: { icon: Mail, label: "Request Sent", color: "text-yellow-600" },
        submitted: { icon: CheckCircle, label: "Received", color: "text-green-600" },
    }

    return (
        <div className="mx-auto max-w-2xl space-y-8">
            <ApplicationProgress currentStep={6} />

            <div className="text-center">
                <h1 className="text-3xl font-bold tracking-tight">Recommendations</h1>
                <p className="mt-2 text-muted-foreground">
                    Request letters of recommendation from people who know you well
                </p>
            </div>

            {/* Info box */}
            <Card className="border-primary/20 bg-primary/5">
                <CardContent className="py-4">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="mt-0.5 h-5 w-5 text-primary" />
                        <div className="text-sm">
                            <p className="font-medium">Recommendation Requirements</p>
                            <p className="mt-1 text-muted-foreground">
                                We require at least <strong>2 letters of recommendation</strong>. Recommenders
                                should be pastors, professors, employers, or others who can speak to your
                                character and academic/professional abilities.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Recommenders list */}
            {recommenders.length > 0 && (
                <div className="space-y-3">
                    <h2 className="font-semibold">Your Recommenders ({recommenders.length}/2 minimum)</h2>
                    {recommenders.map((rec) => {
                        const StatusIcon = statusConfig[rec.status].icon
                        return (
                            <Card key={rec.id}>
                                <CardContent className="flex items-center justify-between py-4">
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                                            <span className="text-lg font-semibold text-primary">
                                                {rec.name.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="font-medium">{rec.name}</p>
                                            <p className="text-sm text-muted-foreground">{rec.email}</p>
                                            <p className="text-xs text-muted-foreground">{rec.relationship}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className={statusConfig[rec.status].color}>
                                            <StatusIcon className="mr-1 h-3 w-3" />
                                            {statusConfig[rec.status].label}
                                        </Badge>
                                        {rec.status === "pending" && (
                                            <>
                                                <Button size="sm" onClick={() => handleSendRequest(rec.id)}>
                                                    <Mail className="mr-1 h-3 w-3" />
                                                    Send Request
                                                </Button>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    onClick={() => handleRemoveRecommender(rec.id)}
                                                >
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            )}

            {/* Add recommender form */}
            {showForm ? (
                <Card>
                    <CardHeader>
                        <CardTitle>Add Recommender</CardTitle>
                        <CardDescription>
                            Enter the contact information for your recommender
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit(onAddRecommender)} className="space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Full Name *</Label>
                                    <Input
                                        id="name"
                                        placeholder="Dr. John Smith"
                                        {...register("name")}
                                        className={errors.name ? "border-destructive" : ""}
                                    />
                                    {errors.name && (
                                        <p className="text-sm text-destructive">{errors.name.message}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address *</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="john.smith@example.com"
                                        {...register("email")}
                                        className={errors.email ? "border-destructive" : ""}
                                    />
                                    {errors.email && (
                                        <p className="text-sm text-destructive">{errors.email.message}</p>
                                    )}
                                </div>
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Title/Position</Label>
                                    <Input
                                        id="title"
                                        placeholder="Senior Pastor"
                                        {...register("title")}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="relationship">Relationship to You *</Label>
                                    <Input
                                        id="relationship"
                                        placeholder="Pastor for 5 years"
                                        {...register("relationship")}
                                        className={errors.relationship ? "border-destructive" : ""}
                                    />
                                    {errors.relationship && (
                                        <p className="text-sm text-destructive">{errors.relationship.message}</p>
                                    )}
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit">Add Recommender</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            ) : (
                <Button
                    variant="outline"
                    className="w-full py-6"
                    onClick={() => setShowForm(true)}
                >
                    <Plus className="mr-2 h-5 w-5" />
                    Add Recommender
                </Button>
            )}

            {/* Navigation */}
            <div className="flex justify-between">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/apply/essay")}
                >
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Back
                </Button>
                <Button
                    onClick={() => router.push("/apply/payment")}
                    disabled={recommenders.length < 2}
                    className="min-w-[150px]"
                >
                    Continue
                    <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
            </div>

            {recommenders.length < 2 && (
                <p className="text-center text-sm text-muted-foreground">
                    Please add at least 2 recommenders to continue
                </p>
            )}
        </div>
    )
}
