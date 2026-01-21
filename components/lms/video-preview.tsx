import { AlertCircle, Video } from "lucide-react"

interface VideoPreviewProps {
    url: string
}

export function VideoPreview({ url }: VideoPreviewProps) {
    if (!url) return null

    const getEmbedUrl = (url: string) => {
        // YouTube
        const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
        const youtubeMatch = url.match(youtubeRegex)
        if (youtubeMatch) {
            return `https://www.youtube.com/embed/${youtubeMatch[1]}`
        }

        // Vimeo
        const vimeoRegex = /(?:vimeo\.com\/)(\d+)/
        const vimeoMatch = url.match(vimeoRegex)
        if (vimeoMatch) {
            return `https://player.vimeo.com/video/${vimeoMatch[1]}`
        }

        return null
    }

    const embedUrl = getEmbedUrl(url)

    if (!embedUrl) {
        return (
            <div className="flex items-center gap-2 rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
                <AlertCircle className="h-4 w-4" />
                <span>Could not recognize video URL. We support YouTube and Vimeo.</span>
            </div>
        )
    }

    return (
        <div className="overflow-hidden rounded-lg border bg-black/5 shadow-sm">
            <div className="relative aspect-video">
                <iframe
                    src={embedUrl}
                    className="absolute inset-0 h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                />
            </div>
            <div className="bg-muted/50 p-2 text-xs text-center text-muted-foreground">
                Video Preview
            </div>
        </div>
    )
}
