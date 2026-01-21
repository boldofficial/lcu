"use client"

import { useState } from "react"
import { getSignedUploadUrl } from "@/app/actions/storage"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Upload, X, Image as ImageIcon } from "lucide-react"
import { toast } from "sonner"

interface ImageUploadProps {
    value?: string
    onChange: (url: string) => void
    disabled?: boolean
    bucket?: string
}

export function ImageUpload({
    value,
    onChange,
    disabled,
    bucket = "blog_images"
}: ImageUploadProps) {
    const [uploading, setUploading] = useState(false)

    async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
        try {
            const file = e.target.files?.[0]
            if (!file) return

            setUploading(true)

            const fileExt = file.name.split('.').pop()
            const fileName = `${Date.now()}-${crypto.randomUUID()}.${fileExt}`

            // Get presigned URL
            const { signedUrl, publicUrl } = await getSignedUploadUrl(fileName, file.type, bucket)

            // Upload to R2
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

            onChange(publicUrl)
            toast.success("Image uploaded")
        } catch (error) {
            toast.error("Upload failed")
            console.error(error)
        } finally {
            setUploading(false)
        }
    }

    function handleRemove() {
        onChange("")
    }

    return (
        <div className="space-y-4 w-full">
            {value ? (
                <div className="relative aspect-video rounded-lg border overflow-hidden bg-muted">
                    <img
                        src={value}
                        alt="Upload"
                        className="object-cover w-full h-full"
                    />
                    <Button
                        onClick={handleRemove}
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8"
                        disabled={disabled}
                        type="button"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            ) : (
                <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            {uploading ? (
                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-2" />
                            ) : (
                                <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                            )}
                            <p className="mb-1 text-sm text-muted-foreground">
                                <span className="font-semibold">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-xs text-muted-foreground">
                                SVG, PNG, JPG or GIF (max 5MB)
                            </p>
                        </div>
                        <Input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleUpload}
                            disabled={disabled || uploading}
                        />
                    </label>
                </div>
            )}
        </div>
    )
}
