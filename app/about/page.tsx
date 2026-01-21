import Image from "next/image"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle2, Users, Target, BookOpen } from "lucide-react"
import Link from "next/link"

export const metadata = {
    title: "About Us",
    description: "Learn about Landmark Christian University's history, mission, and vision.",
}

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-white">
            <SiteHeader />

            {/* Hero Section */}
            <section className="relative flex min-h-[400px] items-center justify-center py-20 bg-[#4a3472]">
                <div className="absolute inset-0 z-0">
                    <Image
                        src="/hero-students.png"
                        alt="About Hero"
                        fill
                        className="object-cover opacity-20 mix-blend-overlay"
                        priority
                    />
                </div>
                <div className="relative z-10 text-center max-w-4xl px-6">
                    <h1 className="text-4xl font-bold md:text-6xl mb-6 text-white leading-tight">
                        Equipping Leaders for <span className="text-[#d4a843]">Kingdom Impact</span>
                    </h1>
                    <p className="text-xl text-gray-200 max-w-2xl mx-auto">
                        Since our founding, we have been dedicated to providing biblically-centered education that empowers students to serve in ministry and the marketplace.
                    </p>
                </div>
            </section>

            {/* Mission & Vision */}
            <section className="py-20 px-6 md:px-12 max-w-7xl mx-auto">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div className="space-y-8">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <Target className="h-8 w-8 text-[#d4a843]" />
                                <h2 className="text-3xl font-bold text-[#4a3472]">Our Mission</h2>
                            </div>
                            <p className="text-lg text-gray-600 leading-relaxed">
                                To raise Christ-centered leaders who are grounded in grace, equipped for service, and empowered to transform their communities through the power of the Holy Spirit.
                            </p>
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <BookOpen className="h-8 w-8 text-[#d4a843]" />
                                <h2 className="text-3xl font-bold text-[#4a3472]">Our Vision</h2>
                            </div>
                            <p className="text-lg text-gray-600 leading-relaxed">
                                To be a global premier institution of higher learning that integrates faith and academic excellence to produce graduates who excel in their chosen fields and advance the Kingdom of God.
                            </p>
                        </div>
                    </div>
                    <div className="relative h-[400px] rounded-2xl overflow-hidden shadow-xl">
                        <Image
                            src="/graduate-student.png"
                            alt="Vision"
                            fill
                            className="object-cover"
                        />
                    </div>
                </div>
            </section>

            {/* Core Values */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-6 md:px-12">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-[#4a3472] mb-4">Our Core Values</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            These principles guide everything we do, from our curriculum design to our community life.
                        </p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { title: "Biblical Truth", desc: "We believe the Bible is the inspired Word of God and the foundation for all learning." },
                            { title: "Academic Excellence", desc: "We are committed to the highest standards of scholarship and intellectual rigor." },
                            { title: "Spiritual Growth", desc: "We foster an environment that encourages deep personal relationships with Jesus Christ." },
                            { title: "Servant Leadership", desc: "We model and teach leadership that seeks to serve others first." },
                            { title: "Global Perspective", desc: "We prepare students to engage with diverse cultures and serve in a global context." },
                            { title: "Integrity", desc: "We uphold honesty, accountability, and ethical conduct in all our dealings." },
                        ].map((value, i) => (
                            <Card key={i} className="border-none shadow-md hover:shadow-lg transition-shadow">
                                <CardContent className="p-8">
                                    <CheckCircle2 className="h-10 w-10 text-[#d4a843] mb-4" />
                                    <h3 className="text-xl font-bold text-[#4a3472] mb-3">{value.title}</h3>
                                    <p className="text-gray-600">{value.desc}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Call to Action */}
            <section className="py-20 text-center px-6">
                <div className="max-w-3xl mx-auto space-y-8">
                    <h2 className="text-4xl font-bold text-[#4a3472]">Join Our Community</h2>
                    <p className="text-xl text-gray-600">
                        Become part of a vibrant academic community dedicated to your spiritual and professional growth.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/apply">
                            <Button size="lg" className="bg-[#d4a843] hover:bg-[#c49935] text-white">
                                Apply Now
                            </Button>
                        </Link>
                        <Link href="/programs">
                            <Button size="lg" variant="outline" className="border-[#4a3472] text-[#4a3472]">
                                View Programs
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            <SiteFooter />
        </div>
    )
}
