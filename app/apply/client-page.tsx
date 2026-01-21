"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ApplicationProgress } from "@/components/apply/application-progress"
import { useApplication, STEPS } from "@/components/apply/application-context"
import { createClient } from "@/lib/supabase/client"
import type { Program } from "@/lib/types"
import { GraduationCap, Clock, BookOpen, ChevronRight, Loader2 } from "lucide-react"

export default function ApplyPageClient() {
    const searchParams = useSearchParams()
    const programIdParam = searchParams.get("program")
    const router = useRouter()
    const { updateFormData, setCurrentStep, formData, isLoading: isContextLoading, currentStep } = useApplication()
    const [programs, setPrograms] = useState<Program[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedProgram, setSelectedProgram] = useState<string | null>(formData.program_id || null)
    // State to manage the loading view while we verify the URL param
    const [isAutoRedirecting, setIsAutoRedirecting] = useState(!!programIdParam)

    useEffect(() => {
        // Only reset to step 1 if we are not loading from context and no program is active
        if (!isContextLoading && !formData.program_id) {
            setCurrentStep(1)
        }

        // If we have a saved step > 1, redirect to it
        if (!isContextLoading && currentStep > 1) {
            const step = STEPS.find(s => s.id === currentStep)
            if (step) {
                router.push(step.path)
            }
        }

        fetchPrograms()
    }, [isContextLoading, formData.program_id, currentStep, router])

    // Effect to handle auto-selection from URL
    useEffect(() => {
        if (!loading && programs.length > 0) {
            if (programIdParam) {
                const programExists = programs.find(p => p.id === programIdParam)
                if (programExists) {
                    handleSelectProgram(programIdParam)
                    router.push("/apply/personal")
                } else {
                    // ID invalid or not found, stop trying to redirect and show list
                    setIsAutoRedirecting(false)
                }
            } else {
                // No param, just show list
                setIsAutoRedirecting(false)
            }
        }
    }, [loading, programs, programIdParam, router])

    async function fetchPrograms() {
        const supabase = createClient()
        const { data } = await supabase
            .from("programs")
            .select("*")
            .eq("is_active", true)
            .order("degree_type", { ascending: true })

        setPrograms(data || [])
        setLoading(false)
    }

    function handleSelectProgram(programId: string) {
        setSelectedProgram(programId)
        updateFormData({ program_id: programId })
    }

    function handleContinue() {
        if (selectedProgram) {
            router.push("/apply/personal")
        }
    }

    const degreeTypeLabels: Record<string, string> = {
        certificate: "Certificate",
        associate: "Associate",
        bachelor: "Bachelor's",
        master: "Master's",
        doctorate: "Doctorate",
    }

    if (loading || isAutoRedirecting) {
        return (
            <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                {isAutoRedirecting && <p className="text-muted-foreground">Initializing application...</p>}
            </div>
        )
    }

    return (
        <div className="mx-auto max-w-4xl space-y-8">
            <ApplicationProgress currentStep={1} />

            <div className="text-center">
                <h1 className="text-3xl font-bold tracking-tight">Choose Your Program</h1>
                <p className="mt-2 text-muted-foreground">
                    Select the degree program you wish to apply for
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                {programs.map((program) => (
                    <Card
                        key={program.id}
                        className={`cursor-pointer transition-all hover:border-primary ${selectedProgram === program.id
                            ? "border-2 border-primary ring-2 ring-primary/20"
                            : ""
                            }`}
                        onClick={() => handleSelectProgram(program.id)}
                    >
                        <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                                <Badge variant="secondary" className="mb-2">
                                    {degreeTypeLabels[program.degree_type] || program.degree_type}
                                </Badge>
                                {selectedProgram === program.id && (
                                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                                        <ChevronRight className="h-3 w-3 text-primary-foreground" />
                                    </div>
                                )}
                            </div>
                            <CardTitle className="text-lg">{program.name}</CardTitle>
                            <CardDescription className="line-clamp-2">
                                {program.description}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                    <BookOpen className="h-4 w-4" />
                                    <span>{program.total_credits} credits</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    <span>{Math.round(program.duration_months / 12)} years</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <GraduationCap className="h-4 w-4" />
                                    <span>${program.tuition_amount?.toLocaleString()}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {programs.length === 0 && (
                <Card className="text-center py-12">
                    <CardContent>
                        <GraduationCap className="mx-auto h-12 w-12 text-muted-foreground" />
                        <p className="mt-4 text-muted-foreground">
                            No programs are currently accepting applications.
                        </p>
                    </CardContent>
                </Card>
            )}

            <div className="flex justify-end">
                <Button
                    size="lg"
                    disabled={!selectedProgram}
                    onClick={handleContinue}
                    className="min-w-[200px]"
                >
                    Continue
                    <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
            </div>
        </div>
    )
}
