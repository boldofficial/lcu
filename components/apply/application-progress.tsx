"use client"

import { Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { STEPS } from "./application-context"

interface ApplicationProgressProps {
    currentStep: number
}

export function ApplicationProgress({ currentStep }: ApplicationProgressProps) {
    return (
        <div className="w-full">
            {/* Desktop progress */}
            <div className="hidden md:block">
                <nav aria-label="Application progress">
                    <ol className="flex items-center justify-between">
                        {STEPS.map((step, index) => (
                            <li key={step.id} className="relative flex flex-1 flex-col items-center">
                                {/* Connector line */}
                                {index !== 0 && (
                                    <div
                                        className={cn(
                                            "absolute left-0 top-4 -translate-y-1/2 h-0.5 w-full -translate-x-1/2",
                                            step.id <= currentStep ? "bg-primary" : "bg-muted"
                                        )}
                                    />
                                )}

                                {/* Step circle */}
                                <div
                                    className={cn(
                                        "relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-medium transition-colors",
                                        step.id < currentStep
                                            ? "border-primary bg-primary text-primary-foreground"
                                            : step.id === currentStep
                                                ? "border-primary bg-background text-primary"
                                                : "border-muted bg-background text-muted-foreground"
                                    )}
                                >
                                    {step.id < currentStep ? (
                                        <Check className="h-4 w-4" />
                                    ) : (
                                        step.id
                                    )}
                                </div>

                                {/* Step name */}
                                <span
                                    className={cn(
                                        "mt-2 text-xs font-medium text-center",
                                        step.id <= currentStep ? "text-foreground" : "text-muted-foreground"
                                    )}
                                >
                                    {step.name}
                                </span>
                            </li>
                        ))}
                    </ol>
                </nav>
            </div>

            {/* Mobile progress */}
            <div className="md:hidden">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">
                        Step {currentStep} of {STEPS.length}
                    </span>
                    <span className="text-sm text-muted-foreground">
                        {STEPS[currentStep - 1]?.name}
                    </span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${(currentStep / STEPS.length) * 100}%` }}
                    />
                </div>
            </div>
        </div>
    )
}
