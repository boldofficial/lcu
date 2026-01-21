"use client"

import type React from "react"
import { createContext, useContext, useState, useCallback, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import type { ApplicationFormData } from "@/lib/types"

interface ApplicationContextType {
    applicationId: string | null
    setApplicationId: (id: string | null) => void
    formData: Partial<ApplicationFormData>
    updateFormData: (data: Partial<ApplicationFormData>) => void
    currentStep: number
    setCurrentStep: (step: number) => void
    isLoading: boolean
    setIsLoading: (loading: boolean) => void
}

const ApplicationContext = createContext<ApplicationContextType | undefined>(undefined)

const STEPS = [
    { id: 1, name: "Program", path: "/apply" },
    { id: 2, name: "Personal Info", path: "/apply/personal" },
    { id: 3, name: "Education", path: "/apply/education" },
    { id: 4, name: "Documents", path: "/apply/documents" },
    { id: 5, name: "Essay", path: "/apply/essay" },
    { id: 6, name: "Recommendations", path: "/apply/recommendations" },
    { id: 7, name: "Payment", path: "/apply/payment" },
    { id: 8, name: "Review", path: "/apply/review" },
]

export function ApplicationProvider({ children }: { children: React.ReactNode }) {
    const [applicationId, setApplicationId] = useState<string | null>(null)
    const [formData, setFormData] = useState<Partial<ApplicationFormData>>({})
    const [currentStep, setCurrentStep] = useState(1)
    const [isLoading, setIsLoading] = useState(true)

    const updateFormData = useCallback((data: Partial<ApplicationFormData>) => {
        setFormData((prev) => ({ ...prev, ...data }))
    }, [])

    useEffect(() => {
        async function loadDraft() {
            try {
                const supabase = createClient()
                const { data: { user } } = await supabase.auth.getUser()

                if (user) {
                    const { data: app } = await supabase
                        .from("applications")
                        .select("*")
                        .eq("applicant_email", user.email)
                        .in("status", ["draft", "submitted", "under_review", "accepted", "waitlisted"])
                        .order("created_at", { ascending: false })
                        .limit(1)
                        .single()

                    if (app) {
                        setApplicationId(app.id)
                        setFormData({
                            program_id: app.program_id,
                            first_name: app.applicant_first_name,
                            last_name: app.applicant_last_name,
                            email: app.applicant_email,
                            phone: app.applicant_phone || "",
                            date_of_birth: app.applicant_date_of_birth || "",
                            address: app.applicant_address || "",
                            city: app.applicant_city || "",
                            state: app.applicant_state || "",
                            zip_code: app.applicant_zip_code || "",
                            country: app.applicant_country || "",
                            previous_institution: app.previous_institution || "",
                            previous_degree: app.previous_degree || "",
                            graduation_year: app.graduation_year || new Date().getFullYear(),
                            gpa: app.gpa || 0,
                            personal_statement: app.personal_statement || ""
                        })

                        if (app.current_step && app.status === 'draft') {
                            setCurrentStep(app.current_step)
                        }
                    }
                }
            } catch (error) {
                console.error("Error loading draft:", error)
            } finally {
                setIsLoading(false)
            }
        }

        loadDraft()
    }, [])

    return (
        <ApplicationContext.Provider
            value={{
                applicationId,
                setApplicationId,
                formData,
                updateFormData,
                currentStep,
                setCurrentStep,
                isLoading,
                setIsLoading,
            }}
        >
            {children}
        </ApplicationContext.Provider>
    )
}

export function useApplication() {
    const context = useContext(ApplicationContext)
    if (context === undefined) {
        throw new Error("useApplication must be used within an ApplicationProvider")
    }
    return context
}

export { STEPS }
