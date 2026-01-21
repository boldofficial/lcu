"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ApplicationProgress } from "@/components/apply/application-progress"
import { useApplication } from "@/components/apply/application-context"
import { ChevronLeft, ChevronRight, Upload, FileText, X, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface UploadedFile {
    id: string
    name: string
    size: number
    type: string
    status: "uploading" | "complete" | "error"
    progress: number
}

const REQUIRED_DOCUMENTS = [
    {
        id: "transcript",
        name: "Academic Transcript",
        description: "Official or unofficial transcript from your most recent institution",
        accept: ".pdf,.jpg,.jpeg,.png",
        required: true,
    },
    {
        id: "government_id",
        name: "Government ID",
        description: "Passport, driver's license, or national ID card",
        accept: ".pdf,.jpg,.jpeg,.png",
        required: true,
    },
    {
        id: "photo",
        name: "Passport Photo",
        description: "Recent passport-style photograph",
        accept: ".jpg,.jpeg,.png",
        required: false,
    },
]

export default function DocumentsPage() {
    const router = useRouter()
    const { setCurrentStep, formData } = useApplication()
    const [uploadedFiles, setUploadedFiles] = useState<Record<string, UploadedFile>>({})

    useEffect(() => {
        setCurrentStep(4)
        if (!formData.previous_institution) {
            router.push("/apply/education")
        }
    }, [setCurrentStep, formData.previous_institution, router])

    const handleFileSelect = useCallback((docId: string, event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            alert("File size must be less than 10MB")
            return
        }

        const fileData: UploadedFile = {
            id: docId,
            name: file.name,
            size: file.size,
            type: file.type,
            status: "uploading",
            progress: 0,
        }

        setUploadedFiles((prev) => ({ ...prev, [docId]: fileData }))

        // Simulate upload progress
        const interval = setInterval(() => {
            setUploadedFiles((prev) => {
                const current = prev[docId]
                if (!current || current.progress >= 100) {
                    clearInterval(interval)
                    return {
                        ...prev,
                        [docId]: { ...current!, status: "complete", progress: 100 },
                    }
                }
                return {
                    ...prev,
                    [docId]: { ...current, progress: current.progress + 20 },
                }
            })
        }, 200)
    }, [])

    const handleRemoveFile = useCallback((docId: string) => {
        setUploadedFiles((prev) => {
            const updated = { ...prev }
            delete updated[docId]
            return updated
        })
    }, [])

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    }

    const requiredComplete = REQUIRED_DOCUMENTS.filter((d) => d.required).every(
        (doc) => uploadedFiles[doc.id]?.status === "complete"
    )

    return (
        <div className="mx-auto max-w-2xl space-y-8">
            <ApplicationProgress currentStep={4} />

            <div className="text-center">
                <h1 className="text-3xl font-bold tracking-tight">Upload Documents</h1>
                <p className="mt-2 text-muted-foreground">
                    Please upload the required documents to support your application
                </p>
            </div>

            <div className="space-y-4">
                {REQUIRED_DOCUMENTS.map((doc) => {
                    const uploaded = uploadedFiles[doc.id]

                    return (
                        <Card key={doc.id} className={cn(
                            uploaded?.status === "complete" && "border-green-500/50 bg-green-50/50 dark:bg-green-950/20"
                        )}>
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <CardTitle className="flex items-center gap-2 text-base">
                                            {doc.name}
                                            {doc.required && (
                                                <span className="text-xs text-destructive">*Required</span>
                                            )}
                                            {uploaded?.status === "complete" && (
                                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                                            )}
                                        </CardTitle>
                                        <CardDescription className="mt-1">{doc.description}</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {uploaded ? (
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between rounded-lg border bg-background p-3">
                                            <div className="flex items-center gap-3">
                                                <FileText className="h-8 w-8 text-primary" />
                                                <div>
                                                    <p className="text-sm font-medium">{uploaded.name}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {formatFileSize(uploaded.size)}
                                                    </p>
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleRemoveFile(doc.id)}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        {uploaded.status === "uploading" && (
                                            <Progress value={uploaded.progress} className="h-2" />
                                        )}
                                    </div>
                                ) : (
                                    <label className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/25 p-6 transition-colors hover:border-primary/50 hover:bg-muted/50">
                                        <Upload className="h-8 w-8 text-muted-foreground" />
                                        <span className="text-sm font-medium">Click to upload</span>
                                        <span className="text-xs text-muted-foreground">
                                            PDF, JPG, or PNG up to 10MB
                                        </span>
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept={doc.accept}
                                            onChange={(e) => handleFileSelect(doc.id, e)}
                                        />
                                    </label>
                                )}
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            <div className="rounded-lg bg-muted p-4 text-sm">
                <p className="font-medium">Tips for document uploads</p>
                <ul className="mt-2 list-inside list-disc space-y-1 text-muted-foreground">
                    <li>Ensure documents are clear and legible</li>
                    <li>PDF format is preferred for transcripts</li>
                    <li>All four corners of IDs should be visible</li>
                    <li>Photos should be recent and passport-style</li>
                </ul>
            </div>

            {/* Navigation */}
            <div className="flex justify-between">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/apply/education")}
                >
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Back
                </Button>
                <Button
                    onClick={() => router.push("/apply/essay")}
                    disabled={!requiredComplete}
                    className="min-w-[150px]"
                >
                    Continue
                    <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
            </div>
        </div>
    )
}
