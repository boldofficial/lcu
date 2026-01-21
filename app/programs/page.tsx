import Link from "next/link"
import Image from "next/image"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/server"
import { BookOpen, Clock, GraduationCap } from "lucide-react"

export const dynamic = "force-dynamic"

export const metadata = {
    title: "Academic Programs",
    description: "Explore our accredited online degree programs in Theology, Ministry, Counseling, and Business.",
}

export default async function ProgramsPage({
    searchParams,
}: {
    searchParams: { [key: string]: string | string[] | undefined }
}) {
    const supabase = await createClient()

    // Fetch programs
    const { data: programs } = await supabase
        .from("programs")
        .select("*")
        .eq("is_active", true)

    // Sort programs: Bachelor, Master, Doctorate, etc. for better display if needed. 
    // For now, we'll just display them as is or separate them by type if we have many.

    return (
        <div className="min-h-screen bg-white">
            <SiteHeader />

            {/* Hero Section */}
            <section className="relative flex min-h-[400px] items-center justify-center py-20 bg-[#4a3472]">
                <div className="absolute inset-0 z-0">
                    <Image
                        src="/hero-students.png"
                        alt="Programs Hero"
                        fill
                        className="object-cover opacity-20 mix-blend-overlay"
                        priority
                    />
                </div>
                <div className="relative z-10 mx-auto max-w-7xl px-6 md:px-12 text-center text-white">
                    <h1 className="text-4xl font-bold md:text-6xl mb-6">Our Academic Programs</h1>
                    <p className="max-w-2xl mx-auto text-lg text-gray-200">
                        Discover accredited degrees designed to equip you for Kingdom leadership.
                        Flexible, online, and spiritually enriching.
                    </p>
                </div>
            </section>

            {/* Programs Grid */}
            <section className="py-20 bg-gray-50">
                <div className="mx-auto max-w-7xl px-6 md:px-12">
                    {programs && programs.length > 0 ? (
                        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                            {programs.map((program) => (
                                <Card key={program.id} className="flex flex-col bg-white overflow-hidden hover:shadow-xl transition-all duration-300 border-0 shadow-md group">
                                    <div className="relative h-48 w-full bg-gray-200 overflow-hidden">
                                        {/* Dynamic program cover image */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#4a3472]/80 to-transparent z-10" />
                                        <Image
                                            src={program.cover_image || `/hero-students.png`}
                                            alt={program.name}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                        <Badge className="absolute top-4 right-4 z-20 bg-[#d4a843] hover:bg-[#c49935] text-white">
                                            {program.degree_type.charAt(0).toUpperCase() + program.degree_type.slice(1)}
                                        </Badge>
                                    </div>

                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-xl font-bold text-[#4a3472] line-clamp-2 min-h-[3.5rem]">
                                            {program.name}
                                        </CardTitle>
                                        <CardDescription className="line-clamp-3">
                                            {program.description || "A comprehensive program designed for ministry leaders."}
                                        </CardDescription>
                                    </CardHeader>

                                    <CardContent className="mt-auto pt-4 space-y-4">
                                        <div className="flex items-center justify-between text-sm text-gray-500 border-t border-gray-100 pt-4">
                                            <div className="flex items-center gap-1">
                                                <Clock className="w-4 h-4 text-[#d4a843]" />
                                                <span>{program.duration_months} Months</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <BookOpen className="w-4 h-4 text-[#d4a843]" />
                                                <span>{program.total_credits} Credits</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm font-semibold text-[#4a3472]">
                                            <GraduationCap className="w-4 h-4" />
                                            <span>{program.department}</span>
                                        </div>

                                        <Link href={`/programs/${program.id}`} className="block">
                                            <Button className="w-full rounded-full bg-[#4a3472] text-white hover:bg-[#3a2857]">
                                                View Details
                                            </Button>
                                        </Link>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20">
                            <h3 className="text-2xl font-bold text-gray-400">No programs found at the moment.</h3>
                            <p className="text-gray-500 mt-2">Please check back later or contact administration.</p>
                        </div>
                    )}
                </div>
            </section>

            <SiteFooter />
        </div>
    )
}
