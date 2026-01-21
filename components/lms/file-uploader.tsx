"use client"

import { useState, useRef } from "react"
import { getSignedUploadUrl } from "@/app/actions/storage"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Upload, X, File as FileIcon } from "lucide-react"
import { toast } from "sonner"

interface Attachment {
    name: string
    url: string
    type: string
}

interface FileUploaderProps {
    onUploadComplete: (attachment: Attachment) => void
    bucketName?: string
    folderPath?: string
}

export function FileUploader({
    onUploadComplete,
    bucketName = "course_content",
    folderPath = "attachments",
}: FileUploaderProps) {
    const [uploading, setUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0]
        if (!file) return

        setUploading(true)

        try {
            // Sanitize filename
            const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_")
            const fileName = `${Date.now()}_${cleanName}`

            // Combine bucketName and folderPath for the R2 "folder"
            // We treat the "bucketName" as a top-level folder in the single R2 bucket
            const storageFolder = `${bucketName}/${folderPath}`

            // Get presigned URL
            const { signedUrl, publicUrl } = await getSignedUploadUrl(fileName, file.type, storageFolder)

            // Upload via PUT
            const response = await fetch(signedUrl, {
                method: "PUT",
                body: file,
                headers: {
                    "Content-Type": file.type,
                },
            })

            if (!response.ok) {
                throw new Error("Upload failed")
            }

            // Callback with attachment info
            onUploadComplete({
                name: file.name,
                url: publicUrl,
                type: file.type.includes('pdf') ? 'pdf' : 'document',
            })

            toast.success("File uploaded successfully!")
        } catch (error) {
            console.error("Upload failed", error)
            toast.error("Failed to upload file")
        } finally {
            setUploading(false)
            // Reset input
            if (fileInputRef.current) {
                fileInputRef.current.value = ""
            }
        }
    }

    return (
        <div className="flex items-center gap-2">
            <Input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileChange}
                disabled={uploading}
            />
            <Button
                type="button"
                variant="outline"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
            >
                {uploading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <Upload className="mr-2 h-4 w-4" />
                )}
                {uploading ? "Uploading..." : "Upload Document"}
            </Button>
        </div>
    )
}

interface AttachmentListProps {
    attachments: Attachment[]
    onRemove: (index: number) => void
}

export function AttachmentList({ attachments, onRemove }: AttachmentListProps) {
    if (!attachments.length) return null

    return (
        <div className="space-y-2 mt-4">
            <p className="text-sm font-medium text-muted-foreground">Attached Files:</p>
            {attachments.map((file, index) => (
                <div key={index} className="flex items-center justify-between rounded-md border bg-muted/40 p-2 text-sm">
                    <div className="flex items-center gap-2 overflow-hidden">
                        <FileIcon className="h-4 w-4 shrink-0 text-primary" />
                        <span className="truncate">{file.name}</span>
                    </div>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-destructive"
                        onClick={() => onRemove(index)}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            ))}
        </div>
    )
}
