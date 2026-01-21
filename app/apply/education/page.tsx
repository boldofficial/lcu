"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ApplicationProgress } from "@/components/apply/application-progress"
import { useApplication } from "@/components/apply/application-context"
import { ChevronLeft, ChevronRight } from "lucide-react"

const educationSchema = z.object({
    previous_institution: z.string().min(2, "Institution name is required"),
    previous_degree: z.string().min(1, "Please select your highest degree"),
    graduation_year: z.coerce.number().min(1950, "Invalid year").max(new Date().getFullYear() + 5, "Invalid year"),
    gpa: z.coerce.number().min(0, "GPA must be at least 0").max(4, "GPA cannot exceed 4.0"),
})

type EducationForm = z.infer<typeof educationSchema>

const DEGREE_TYPES = [
    { value: "high_school", label: "High School Diploma / GED" },
    { value: "some_college", label: "Some College (No Degree)" },
    { value: "associate", label: "Associate Degree" },
    { value: "bachelor", label: "Bachelor's Degree" },
    { value: "master", label: "Master's Degree" },
    { value: "doctorate", label: "Doctorate" },
    { value: "other", label: "Other" },
]

export default function EducationPage() {
    const router = useRouter()
    const { updateFormData, setCurrentStep, formData } = useApplication()

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<EducationForm>({
        resolver: zodResolver(educationSchema),
        defaultValues: {
            previous_institution: formData.previous_institution || "",
            previous_degree: formData.previous_degree || "",
            graduation_year: formData.graduation_year || new Date().getFullYear(),
            gpa: formData.gpa || 0,
        },
    })

    useEffect(() => {
        setCurrentStep(3)
        // Redirect if previous steps not completed
        if (!formData.email) {
            router.push("/apply/personal")
        }
    }, [setCurrentStep, formData.email, router])

    function onSubmit(data: EducationForm) {
        updateFormData(data)
        router.push("/apply/documents")
    }

    const selectedDegree = watch("previous_degree")

    // Generate year options (last 50 years + 5 years future)
    const currentYear = new Date().getFullYear()
    const years = Array.from({ length: 56 }, (_, i) => currentYear + 5 - i)

    return (
        <div className="mx-auto max-w-2xl space-y-8">
            <ApplicationProgress currentStep={3} />

            <div className="text-center">
                <h1 className="text-3xl font-bold tracking-tight">Academic History</h1>
                <p className="mt-2 text-muted-foreground">
                    Tell us about your educational background
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Previous Education</CardTitle>
                    <CardDescription>
                        Please provide information about your most recent educational institution.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {/* Institution Name */}
                        <div className="space-y-2">
                            <Label htmlFor="previous_institution">Institution Name *</Label>
                            <Input
                                id="previous_institution"
                                placeholder="University of Example"
                                {...register("previous_institution")}
                                className={errors.previous_institution ? "border-destructive" : ""}
                            />
                            {errors.previous_institution && (
                                <p className="text-sm text-destructive">{errors.previous_institution.message}</p>
                            )}
                        </div>

                        {/* Degree Type */}
                        <div className="space-y-2">
                            <Label htmlFor="previous_degree">Highest Degree Earned *</Label>
                            <Select
                                value={selectedDegree}
                                onValueChange={(value) => setValue("previous_degree", value)}
                            >
                                <SelectTrigger className={errors.previous_degree ? "border-destructive" : ""}>
                                    <SelectValue placeholder="Select your highest degree" />
                                </SelectTrigger>
                                <SelectContent>
                                    {DEGREE_TYPES.map((degree) => (
                                        <SelectItem key={degree.value} value={degree.value}>
                                            {degree.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.previous_degree && (
                                <p className="text-sm text-destructive">{errors.previous_degree.message}</p>
                            )}
                        </div>

                        {/* Graduation Year & GPA */}
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="graduation_year">Graduation Year *</Label>
                                <Select
                                    value={watch("graduation_year")?.toString()}
                                    onValueChange={(value) => setValue("graduation_year", parseInt(value))}
                                >
                                    <SelectTrigger className={errors.graduation_year ? "border-destructive" : ""}>
                                        <SelectValue placeholder="Select year" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {years.map((year) => (
                                            <SelectItem key={year} value={year.toString()}>
                                                {year}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.graduation_year && (
                                    <p className="text-sm text-destructive">{errors.graduation_year.message}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="gpa">GPA (0.0 - 4.0 scale) *</Label>
                                <Input
                                    id="gpa"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max="4"
                                    placeholder="3.50"
                                    {...register("gpa")}
                                    className={errors.gpa ? "border-destructive" : ""}
                                />
                                {errors.gpa && (
                                    <p className="text-sm text-destructive">{errors.gpa.message}</p>
                                )}
                            </div>
                        </div>

                        {/* Info box */}
                        <div className="rounded-lg bg-muted p-4 text-sm">
                            <p className="font-medium">Note about transcripts</p>
                            <p className="mt-1 text-muted-foreground">
                                You will be asked to upload official transcripts in the next step.
                                Unofficial transcripts are acceptable for the initial application,
                                but official transcripts will be required upon admission.
                            </p>
                        </div>

                        {/* Navigation */}
                        <div className="flex justify-between pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.push("/apply/personal")}
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
