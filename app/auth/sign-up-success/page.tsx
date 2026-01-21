"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Cross, Mail, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

import { Suspense } from "react"
import { Loader2 } from "lucide-react"

function SignUpSuccessContent() {
  const searchParams = useSearchParams()
  const next = searchParams.get("next")

  const loginUrl = next ? `/auth/login?next=${encodeURIComponent(next)}` : "/auth/login"

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-muted/30 p-6 md:p-10">
      <Link href="/" className="mb-8 flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
          <Cross className="h-6 w-6 text-primary-foreground" />
        </div>
        <div>
          <span className="text-lg font-bold text-foreground">Landmark Christian University</span>
        </div>
      </Link>
      <div className="w-full max-w-md">
        <Card className="border-2">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle2 className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Application Submitted!</CardTitle>
            <CardDescription>Thank you for applying to Landmark Christian University</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="mb-6 flex items-center justify-center gap-2 rounded-lg bg-muted p-4">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Please check your email to confirm your account</p>
            </div>
            <p className="mb-6 text-sm text-muted-foreground">
              {
                "Once confirmed, you'll be able to access your student portal, complete your enrollment, and begin your academic journey."
              }
            </p>
            <Link href={loginUrl}>
              <Button className="w-full">Continue to Sign In</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function SignUpSuccessPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
      <SignUpSuccessContent />
    </Suspense>
  )
}
