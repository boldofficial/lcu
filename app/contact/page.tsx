"use client"

import { useState } from "react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { MapPin, Phone, Mail, Clock, Send, Loader2 } from "lucide-react"
import { toast } from "sonner"

export default function ContactPage() {
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)

        // Simulate form submission
        await new Promise(resolve => setTimeout(resolve, 1500))

        toast.success("Thank you for your message! We'll get back to you soon.")
            ; (e.target as HTMLFormElement).reset()
        setLoading(false)
    }

    return (
        <div className="min-h-screen bg-white">
            <SiteHeader />

            {/* Hero */}
            <section className="bg-[#4a3472] py-16 text-white">
                <div className="mx-auto max-w-7xl px-6 md:px-12 text-center">
                    <h1 className="text-4xl font-bold md:text-5xl">Contact Us</h1>
                    <p className="mt-4 text-lg text-white/80 max-w-2xl mx-auto">
                        We&apos;d love to hear from you. Reach out with questions about our programs, admissions, or anything else.
                    </p>
                </div>
            </section>

            {/* Contact Content */}
            <section className="py-16 lg:py-24">
                <div className="mx-auto max-w-7xl px-6 md:px-12">
                    <div className="grid gap-12 lg:grid-cols-2">
                        {/* Contact Form */}
                        <Card className="border-0 shadow-xl">
                            <CardHeader>
                                <CardTitle className="text-2xl text-[#4a3472]">Send Us a Message</CardTitle>
                                <CardDescription>
                                    Fill out the form below and we&apos;ll respond within 24-48 hours.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="firstName">First Name</Label>
                                            <Input id="firstName" required placeholder="John" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="lastName">Last Name</Label>
                                            <Input id="lastName" required placeholder="Doe" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input id="email" type="email" required placeholder="john@example.com" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Phone (Optional)</Label>
                                        <Input id="phone" type="tel" placeholder="+1 (555) 123-4567" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="subject">Subject</Label>
                                        <Input id="subject" required placeholder="How can we help?" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="message">Message</Label>
                                        <Textarea
                                            id="message"
                                            required
                                            placeholder="Tell us more about your inquiry..."
                                            rows={5}
                                        />
                                    </div>
                                    <Button
                                        type="submit"
                                        className="w-full bg-[#d4a843] hover:bg-[#c49935]"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        ) : (
                                            <Send className="mr-2 h-4 w-4" />
                                        )}
                                        Send Message
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>

                        {/* Contact Info */}
                        <div className="space-y-8">
                            <div>
                                <h2 className="text-2xl font-bold text-[#4a3472] mb-6">Contact Information</h2>
                                <div className="space-y-6">
                                    <div className="flex items-start gap-4">
                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#4a3472]/10">
                                            <MapPin className="h-6 w-6 text-[#4a3472]" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">Main Campus</h3>
                                            <p className="text-gray-600">1820 St. Marks 56, Largo</p>
                                            <p className="text-gray-600">United States</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#4a3472]/10">
                                            <Phone className="h-6 w-6 text-[#4a3472]" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">Phone</h3>
                                            <p className="text-gray-600">+1 272 458 4332</p>
                                            <p className="text-gray-600">+1 272 765 8888</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#4a3472]/10">
                                            <Mail className="h-6 w-6 text-[#4a3472]" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">Email</h3>
                                            <p className="text-gray-600">info@landmarkchristian.edu</p>
                                            <p className="text-gray-600">admissions@landmarkchristian.edu</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#4a3472]/10">
                                            <Clock className="h-6 w-6 text-[#4a3472]" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">Office Hours</h3>
                                            <p className="text-gray-600">Monday - Friday: 9:00 AM - 5:00 PM EST</p>
                                            <p className="text-gray-600">Saturday - Sunday: Closed</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Map Placeholder */}
                            <div className="aspect-video rounded-xl bg-gray-100 flex items-center justify-center border">
                                <p className="text-gray-500">Map integration coming soon</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <SiteFooter />
        </div>
    )
}
