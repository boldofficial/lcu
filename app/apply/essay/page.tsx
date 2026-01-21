"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ApplicationProgress } from "@/components/apply/application-progress"
import { useApplication } from "@/components/apply/application-context"
import { ChevronLeft, ChevronRight, Lightbulb } from "lucide-react"

const essaySchema = z.object({
    personal_statement: z
        .string()
        .min(250, "Personal statement must be at least 250 characters")
        .max(5000, "Personal statement cannot exceed 5000 characters"),
})

type EssayForm = z.infer<typeof essaySchema>

const ESSAY_PROMPTS = [
    "Describe your calling to ministry and how you hope this degree will help you fulfill it.",
    "Share a significant life experience that shaped your faith journey.",
    "Explain how you plan to use your education to serve your community.",
]

export default function EssayPage() {
    const router = useRouter()
    const { updateFormData, setCurrentStep, formData } = useApplication()

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<EssayForm>({
        resolver: zodResolver(essaySchema),
        defaultValues: {
            personal_statement: formData.personal_statement || "",
        },
    })

    useEffect(() => {
        setCurrentStep(5)
    }, [setCurrentStep])

    function onSubmit(data: EssayForm) {
        updateFormData(data)
        router.push("/apply/recommendations")
    }

    const statementValue = watch("personal_statement") || ""
    const characterCount = statementValue.length
    const wordCount = statementValue.trim() ? statementValue.trim().split(/\s+/).length : 0

    return (
        <div className="mx-auto max-w-2xl space-y-8">
            <ApplicationProgress currentStep={5} />

            <div className="text-center">
                <h1 className="text-3xl font-bold tracking-tight">Personal Statement</h1>
                <p className="mt-2 text-muted-foreground">
                    Tell us about yourself and your aspirations
                </p>
            </div>

            {/* Essay Prompts */}
            <Card className="border-primary/20 bg-primary/5">
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Lightbulb className="h-5 w-5 text-primary" />
                        Writing Prompts
                    </CardTitle>
                    <CardDescription>
                        Consider addressing one or more of these topics in your statement
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-2">
                        {ESSAY_PROMPTS.map((prompt, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm">
                                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-medium text-primary">
                                    {index + 1}
                                </span>
                                <span className="text-muted-foreground">{prompt}</span>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Your Statement</CardTitle>
                    <CardDescription>
                        Write a personal statement of 250-5000 characters (approximately 50-1000 words).
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="personal_statement" className="sr-only">
                                Personal Statement
                            </Label>
                            <Textarea
                                id="personal_statement"
                                placeholder="Begin your personal statement here..."
                                className={`min-h-[300px] resize-y ${errors.personal_statement ? "border-destructive" : ""
                                    }`}
                                {...register("personal_statement")}
                            />
                            <div className="flex items-center justify-between text-sm">
                                <div>
                                    {errors.personal_statement && (
                                        <p className="text-destructive">{errors.personal_statement.message}</p>
                                    )}
                                </div>
                                <div className="text-muted-foreground">
                                    {wordCount} words · {characterCount}/5000 characters
                                </div>
                            </div>
                        </div>

                        {/* Tips */}
                        <div className="rounded-lg bg-muted p-4 text-sm">
                            <p className="font-medium">Tips for a strong personal statement</p>
                            <ul className="mt-2 list-inside list-disc space-y-1 text-muted-foreground">
                                <li>Be authentic and share your genuine story</li>
                                <li>Explain your motivation for pursuing this degree</li>
                                <li>Describe how your faith has influenced your goals</li>
                                <li>Proofread carefully before submitting</li>
                            </ul>
                        </div>

                        {/* Navigation */}
                        <div className="flex justify-between pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.push("/apply/documents")}
                            >
                                <ChevronLeft className="mr-2 h-4 w-4" />
                                Back
                            </Button>
                            <Button type="submit" className="min-w-[150px]">
                                Continue
                                <ChevronRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
