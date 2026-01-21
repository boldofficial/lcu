"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, RefreshCw, LayoutDashboard } from "lucide-react"
import Link from "next/link"

export default function RegistrarError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error("Registrar error:", error)
    }, [error])

    return (
        <div className="flex min-h-[60vh] items-center justify-center p-6">
            <Card className="w-full max-w-md border-2">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
                        <AlertTriangle className="h-7 w-7 text-destructive" />
                    </div>
                    <CardTitle className="text-xl">Registrar Portal Error</CardTitle>
                    <CardDescription>
                        An error occurred in the registrar area. Please try again.
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
                            <Link href="/registrar">
                                <LayoutDashboard className="mr-2 h-4 w-4" />
                                Registrar Home
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
