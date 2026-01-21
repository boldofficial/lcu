import { Loader2 } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

export default function BlogLoading() {
    return (
        <div className="min-h-screen bg-white">
            <SiteHeader />
            <div className="flex h-96 items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-10 w-10 animate-spin text-[#4a3472]" />
                    <p className="text-muted-foreground">Loading articles...</p>
                </div>
            </div>
            <SiteFooter />
        </div>
    )
}
