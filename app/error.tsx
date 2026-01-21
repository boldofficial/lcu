"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, RefreshCw, Home } from "lucide-react"
import Link from "next/link"

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        // Log error to monitoring service
        console.error("Global error:", error)
    }, [error])

    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/30 p-6">
            <Card className="w-full max-w-md border-2">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                        <AlertTriangle className="h-8 w-8 text-destructive" />
                    </div>
                    <CardTitle className="text-2xl">Something went wrong</CardTitle>
                    <CardDescription>
                        An unexpected error occurred. Our team has been notified.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {error.digest && (
                        <p className="text-center text-sm text-muted-foreground">
                            Error ID: <code className="rounded bg-muted px-1">{error.digest}</code>
                        </p>
                    )}
                    <div className="flex flex-col gap-2 sm:flex-row">
                        <Button onClick={reset} className="flex-1" variant="default">
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Try Again
                        </Button>
                        <Button asChild variant="outline" className="flex-1">
                            <Link href="/">
                                <Home className="mr-2 h-4 w-4" />
                                Go Home
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
