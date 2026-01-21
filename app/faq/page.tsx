import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export const metadata = {
    title: "Frequently Asked Questions",
    description: "Find answers to common questions about Landmark Christian University programs, admissions, and more.",
}

const faqs = [
    {
        category: "Admissions",
        questions: [
            {
                q: "What are the admission requirements?",
                a: "Admission requirements vary by program. Generally, you need a high school diploma or equivalent for undergraduate programs, and a bachelor's degree for graduate programs. Some programs may require prior coursework or ministry experience."
            },
            {
                q: "Is there an application deadline?",
                a: "LCU offers rolling admissions, meaning you can apply at any time. However, we recommend applying at least 4-6 weeks before your intended start date to allow time for processing."
            },
            {
                q: "What is the application fee?",
                a: "The application fee varies by program, typically ranging from $50-$100. This fee is non-refundable but may be waived in certain circumstances. Contact admissions for details."
            },
            {
                q: "Can I transfer credits from another institution?",
                a: "Yes, we accept transfer credits from accredited institutions. Up to 75% of a program's credits may be transferred, subject to evaluation. Submit your official transcripts for review."
            }
        ]
    },
    {
        category: "Programs & Courses",
        questions: [
            {
                q: "Are the programs fully online?",
                a: "Yes, all our programs are 100% online, allowing you to study from anywhere in the world with an internet connection. Our flexible format accommodates working professionals and ministry leaders."
            },
            {
                q: "How long does it take to complete a program?",
                a: "Program duration varies. Certificate programs can be completed in 6-12 months, bachelor's degrees in 3-4 years, master's degrees in 1.5-2 years, and doctoral programs in 3-4 years. Our self-paced format may allow faster completion."
            },
            {
                q: "Is LCU accredited?",
                a: "Yes, Landmark Christian University is accredited. Our accreditation ensures your degree is recognized by employers, ministry organizations, and other academic institutions."
            },
            {
                q: "What technology do I need?",
                a: "You need a computer (Windows or Mac), reliable internet connection, and a modern web browser. Some courses may require a webcam and microphone for video discussions."
            }
        ]
    },
    {
        category: "Tuition & Financial Aid",
        questions: [
            {
                q: "How much does tuition cost?",
                a: "Tuition varies by program and degree level. Please visit our Programs page for specific tuition information. We strive to keep our education affordable and accessible."
            },
            {
                q: "Are payment plans available?",
                a: "Yes, we offer flexible payment plans that allow you to pay tuition in monthly installments. Contact our financial services team to set up a plan that works for your budget."
            },
            {
                q: "Do you offer scholarships?",
                a: "Yes, LCU offers various scholarships for qualifying students, including ministry scholarships, academic scholarships, and need-based financial aid. Apply early as funds are limited."
            },
            {
                q: "Can I use employer tuition reimbursement?",
                a: "Absolutely! Many students use employer tuition reimbursement programs. We can provide documentation as needed for your employer's requirements."
            }
        ]
    },
    {
        category: "Student Support",
        questions: [
            {
                q: "How do I access my courses?",
                a: "After enrollment, you'll receive login credentials for our Learning Management System (LMS). All course materials, assignments, and discussions are accessed through this portal."
            },
            {
                q: "What support is available for students?",
                a: "We provide academic advising, technical support, library resources, and spiritual mentoring. Our student success team is available to help you throughout your academic journey."
            },
            {
                q: "How do I contact my professors?",
                a: "You can communicate with professors through the LMS messaging system, discussion forums, or email. Most professors respond within 24-48 hours during business days."
            },
            {
                q: "Are there opportunities to connect with other students?",
                a: "Yes! We have online discussion forums, virtual study groups, and occasional virtual events. Many students form lasting connections with their cohort members."
            }
        ]
    }
]

export default function FAQPage() {
    return (
        <div className="min-h-screen bg-white">
            <SiteHeader />

            {/* Hero */}
            <section className="bg-[#4a3472] py-16 text-white">
                <div className="mx-auto max-w-7xl px-6 md:px-12 text-center">
                    <h1 className="text-4xl font-bold md:text-5xl">Frequently Asked Questions</h1>
                    <p className="mt-4 text-lg text-white/80 max-w-2xl mx-auto">
                        Find answers to common questions about our programs, admissions, and student life.
                    </p>
                </div>
            </section>

            {/* FAQ Content */}
            <section className="py-16 lg:py-24">
                <div className="mx-auto max-w-4xl px-6 md:px-12">
                    {faqs.map((category, index) => (
                        <div key={index} className="mb-12">
                            <h2 className="text-2xl font-bold text-[#4a3472] mb-6">{category.category}</h2>
                            <Accordion type="single" collapsible className="space-y-4">
                                {category.questions.map((faq, faqIndex) => (
                                    <AccordionItem
                                        key={faqIndex}
                                        value={`${index}-${faqIndex}`}
                                        className="border rounded-lg px-4"
                                    >
                                        <AccordionTrigger className="text-left font-semibold hover:text-[#4a3472]">
                                            {faq.q}
                                        </AccordionTrigger>
                                        <AccordionContent className="text-gray-600 leading-relaxed">
                                            {faq.a}
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </div>
                    ))}

                    {/* CTA */}
                    <div className="mt-16 text-center bg-gray-50 rounded-2xl p-8">
                        <h3 className="text-2xl font-bold text-[#4a3472] mb-4">
                            Still have questions?
                        </h3>
                        <p className="text-gray-600 mb-6">
                            Our admissions team is here to help you on your educational journey.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href="/contact">
                                <Button className="bg-[#d4a843] hover:bg-[#c49935] min-w-[160px]">
                                    Contact Us
                                </Button>
                            </Link>
                            <Link href="/apply">
                                <Button variant="outline" className="border-[#4a3472] text-[#4a3472] min-w-[160px]">
                                    Apply Now
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <SiteFooter />
        </div>
    )
}
