import Link from "next/link"
import Image from "next/image"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { createClient } from "@/lib/supabase/server"
import {
    BookOpen,
    Clock,
    GraduationCap,
    CheckCircle2,
    ArrowLeft,
    Calendar,
    DollarSign,
    FileText
} from "lucide-react"
import { notFound } from "next/navigation"

export const dynamic = "force-dynamic"

export const metadata = {
    title: "Program Details",
    description: "Learn more about our accredited online degree programs.",
}

// Helper to format currency
const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
    }).format(amount)
}

export default async function ProgramDetailsPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    // Await params for Next.js 15+
    const { id } = await params
    const supabase = await createClient()

    // Fetch program details
    const { data: program, error: programError } = await supabase
        .from("programs")
        .select("*")
        .eq("id", id)
        .single()

    if (programError || !program) {
        notFound()
    }

    // Fetch courses for this program
    const { data: courses } = await supabase
        .from("courses")
        .select("*")
        .eq("program_id", id)
        .order("order_index", { ascending: true })

    return (
        <div className="min-h-screen bg-white">
            <SiteHeader />

            {/* Hero Section */}
            <section className="relative flex min-h-[400px] items-center py-20 bg-[#4a3472]">
                <div className="absolute inset-0 z-0">
                    <Image
                        src={program.cover_image || "/hero-students.png"}
                        alt="Program Hero"
                        fill
                        className="object-cover opacity-20 mix-blend-overlay"
                        priority
                    />
                </div>
                <div className="relative z-10 mx-auto max-w-7xl px-6 md:px-12 w-full">
                    <Link
                        href="/programs"
                        className="inline-flex items-center text-gray-300 hover:text-[#d4a843] mb-8 transition-colors"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Programs
                    </Link>
                    <div className="max-w-4xl">
                        <Badge className="mb-6 bg-[#d4a843] hover:bg-[#c49935] text-white text-base px-4 py-1">
                            {program.degree_type.toUpperCase()}
                        </Badge>
                        <h1 className="text-4xl font-bold md:text-6xl mb-6 text-white leading-tight">
                            {program.name}
                        </h1>
                        <div className="flex flex-wrap gap-6 text-gray-200 text-lg">
                            <span className="flex items-center gap-2">
                                <GraduationCap className="h-5 w-5 text-[#d4a843]" />
                                {program.department} Department
                            </span>
                            <span className="flex items-center gap-2">
                                <Clock className="h-5 w-5 text-[#d4a843]" />
                                {program.duration_months} Months
                            </span>
                            <span className="flex items-center gap-2">
                                <BookOpen className="h-5 w-5 text-[#d4a843]" />
                                {program.total_credits} Credits
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            <div className="mx-auto max-w-7xl px-6 md:px-12 py-16">
                <div className="grid gap-12 lg:grid-cols-3">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-12">
                        {/* Overview */}
                        <section>
                            <h2 className="text-3xl font-bold text-[#4a3472] mb-6">Program Overview</h2>
                            <div className="prose prose-lg text-gray-600 leading-relaxed">
                                <p>{program.description || "No description available for this program."}</p>
                                <p className="mt-4">
                                    This program is designed to provide you with a deep understanding of biblical principles
                                    and practical ministry skills. Whether you are called to full-time ministry or
                                    marketplace leadership, our curriculum will equip you to make a lasting impact.
                                </p>
                            </div>
                        </section>

                        {/* Curriculum / Courses */}
                        <section>
                            <h2 className="text-3xl font-bold text-[#4a3472] mb-6">Curriculum</h2>
                            <p className="text-gray-600 mb-8">
                                The following courses are required for the completion of this degree.
                                Each course is designed to build upon the last, ensuring a comprehensive educational experience.
                            </p>

                            {courses && courses.length > 0 ? (
                                <Accordion type="single" collapsible className="w-full">
                                    {courses.map((course, index) => (
                                        <AccordionItem key={course.id} value={course.id} className="border-gray-200">
                                            <AccordionTrigger className="hover:text-[#d4a843] text-left">
                                                <div className="flex items-center gap-4">
                                                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#4a3472]/10 text-[#4a3472] text-sm font-bold">
                                                        {index + 1}
                                                    </span>
                                                    <span className="text-lg font-semibold text-gray-800">
                                                        {course.code}: {course.name}
                                                    </span>
                                                </div>
                                            </AccordionTrigger>
                                            <AccordionContent className="text-gray-600 pl-12 pr-4 pb-4">
                                                <div className="mb-2">
                                                    <Badge variant="outline" className="mr-2 border-[#d4a843] text-[#d4a843]">
                                                        {course.credits} Credits
                                                    </Badge>
                                                    <Badge variant="outline" className="border-gray-300 text-gray-500">
                                                        {course.duration_weeks} Weeks
                                                    </Badge>
                                                </div>
                                                <p>{course.description || "Course details coming soon."}</p>
                                            </AccordionContent>
                                        </AccordionItem>
                                    ))}
                                </Accordion>
                            ) : (
                                <div className="p-8 border rounded-xl bg-gray-50 text-center text-gray-500">
                                    No courses listed for this program yet.
                                </div>
                            )}
                        </section>

                        {/* Admissions Requirements (Placeholder) */}
                        <section>
                            <h2 className="text-3xl font-bold text-[#4a3472] mb-6">Admission Requirements</h2>
                            <ul className="space-y-4">
                                {[
                                    "Completed online application form",
                                    "Official high school transcripts or GED (for Bachelor's)",
                                    "Official college transcripts (for Graduate programs)",
                                    "Two letters of recommendation",
                                    "A personal essay describing your faith journey",
                                    "Application fee payment"
                                ].map((req, i) => (
                                    <li key={i} className="flex items-start gap-3 text-gray-600">
                                        <CheckCircle2 className="h-6 w-6 text-[#d4a843] shrink-0" />
                                        <span>{req}</span>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    </div>

                    {/* Sidebar / Stats Card */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24">
                            <Card className="border-0 shadow-xl overflow-hidden">
                                <div className="bg-[#4a3472] p-6 text-white text-center">
                                    <h3 className="text-lg font-medium opacity-90">Total Tuition</h3>
                                    <div className="text-4xl font-bold mt-2">
                                        {formatCurrency(program.tuition_amount)}
                                    </div>
                                    <p className="text-sm mt-2 opacity-75">Financial aid available for eligible students</p>
                                </div>
                                <CardContent className="p-8 space-y-6">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                                            <span className="text-gray-500 flex items-center gap-2">
                                                <Calendar className="w-4 h-4" /> Duration
                                            </span>
                                            <span className="font-semibold text-[#4a3472]">{program.duration_months} Months</span>
                                        </div>
                                        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                                            <span className="text-gray-500 flex items-center gap-2">
                                                <BookOpen className="w-4 h-4" /> Credits
                                            </span>
                                            <span className="font-semibold text-[#4a3472]">{program.total_credits}</span>
                                        </div>
                                        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                                            <span className="text-gray-500 flex items-center gap-2">
                                                <DollarSign className="w-4 h-4" /> Cost Per Credit
                                            </span>
                                            <span className="font-semibold text-[#4a3472]">
                                                {formatCurrency(program.tuition_amount / program.total_credits)}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                                            <span className="text-gray-500 flex items-center gap-2">
                                                <FileText className="w-4 h-4" /> Application Fee
                                            </span>
                                            <span className="font-semibold text-[#4a3472]">
                                                {formatCurrency(program.application_fee || 50)}
                                            </span>
                                        </div>
                                    </div>

                                    <Link href={`/apply?program=${program.id}`} className="block">
                                        <Button className="w-full h-12 text-base font-semibold rounded-full bg-[#d4a843] hover:bg-[#c49935] text-white shadow-lg hover:shadow-xl transition-all">
                                            Apply for this Program
                                        </Button>
                                    </Link>

                                    <p className="text-xs text-center text-gray-400">
                                        By applying, you agree to our terms of service and privacy policy.
                                    </p>
                                </CardContent>
                            </Card>

                            {/* Help Box */}
                            <div className="mt-8 p-6 bg-[#faf6ee] rounded-xl border border-[#d4a843]/20">
                                <h4 className="font-bold text-[#4a3472] mb-2">Need Guidance?</h4>
                                <p className="text-sm text-gray-600 mb-4">
                                    Our admissions counselors are here to help you choose the right path for your calling.
                                </p>
                                <Button variant="outline" className="w-full border-[#4a3472] text-[#4a3472] hover:bg-[#4a3472] hover:text-white">
                                    Contact Admissions
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <SiteFooter />
        </div>
    )
}
