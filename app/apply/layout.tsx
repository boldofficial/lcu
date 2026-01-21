import type React from "react"
import Link from "next/link"
import Image from "next/image"
import { ApplicationProvider } from "@/components/apply/application-context"

export default function ApplyLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <ApplicationProvider>
            <div className="min-h-screen bg-muted/30">
                {/* Header */}
                <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                    <div className="container flex h-16 items-center justify-between">
                        <Link href="/" className="flex items-center gap-2 pl-4">
                            <div className="relative h-16 w-64">
                                <Image
                                    src="/images/lcu-logo.png"
                                    alt="Landmark Christian University"
                                    fill
                                    className="object-contain object-left"
                                    priority
                                />
                            </div>
                        </Link>
                        <div className="text-sm text-muted-foreground">
                            Need help?{" "}
                            <a href="mailto:admissions@lcu.edu" className="text-primary hover:underline">
                                Contact Admissions
                            </a>
                        </div>
                    </div>
                </header>

                {/* Main content */}
                <main className="container py-8">
                    {children}
                </main>

                {/* Footer */}
                <footer className="border-t bg-background py-6">
                    <div className="container text-center text-sm text-muted-foreground">
                        <p>© {new Date().getFullYear()} Landmark Christian University. All rights reserved.</p>
                        <p className="mt-1">
                            <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
                            {" · "}
                            <Link href="/terms" className="hover:underline">Terms of Service</Link>
                        </p>
                    </div>
                </footer>
            </div>
        </ApplicationProvider>
    )
}
