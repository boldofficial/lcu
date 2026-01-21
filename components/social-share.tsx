"use client"

import { Facebook, Twitter, Linkedin, Link2, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useState } from "react"
import { toast } from "sonner"

interface SocialShareProps {
    url: string
    title: string
    description?: string
}

export function SocialShare({ url, title, description }: SocialShareProps) {
    const [copied, setCopied] = useState(false)

    const encodedUrl = encodeURIComponent(url)
    const encodedTitle = encodeURIComponent(title)
    const encodedDescription = encodeURIComponent(description || "")

    const shareLinks = {
        twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    }

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(url)
            setCopied(true)
            toast.success("Link copied to clipboard!")
            setTimeout(() => setCopied(false), 2000)
        } catch (err) {
            toast.error("Failed to copy link")
        }
    }

    return (
        <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Share:</span>
            <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full hover:bg-[#1DA1F2]/10 hover:text-[#1DA1F2]"
                asChild
            >
                <a href={shareLinks.twitter} target="_blank" rel="noopener noreferrer">
                    <Twitter className="h-4 w-4" />
                </a>
            </Button>
            <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full hover:bg-[#4267B2]/10 hover:text-[#4267B2]"
                asChild
            >
                <a href={shareLinks.facebook} target="_blank" rel="noopener noreferrer">
                    <Facebook className="h-4 w-4" />
                </a>
            </Button>
            <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full hover:bg-[#0077B5]/10 hover:text-[#0077B5]"
                asChild
            >
                <a href={shareLinks.linkedin} target="_blank" rel="noopener noreferrer">
                    <Linkedin className="h-4 w-4" />
                </a>
            </Button>
            <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={copyToClipboard}
            >
                {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                ) : (
                    <Link2 className="h-4 w-4" />
                )}
            </Button>
        </div>
    )
}
