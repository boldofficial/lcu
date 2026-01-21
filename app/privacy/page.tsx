import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

export const metadata = {
    title: "Privacy Policy",
    description: "Privacy Policy for Landmark Christian University",
}

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-white">
            <SiteHeader />

            <main className="py-16 lg:py-24">
                <div className="mx-auto max-w-4xl px-6 md:px-12">
                    <h1 className="text-4xl font-bold text-[#4a3472] mb-8">Privacy Policy</h1>

                    <div className="prose prose-lg max-w-none text-gray-600">
                        <p className="text-sm text-muted-foreground mb-8">
                            Last updated: January 2025
                        </p>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-[#4a3472] mb-4">1. Introduction</h2>
                            <p>
                                Landmark Christian University (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our educational services.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-[#4a3472] mb-4">2. Information We Collect</h2>
                            <p className="mb-4">We may collect the following types of information:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li><strong>Personal Information:</strong> Name, email address, phone number, mailing address, date of birth, and other identifying information you provide during registration or application.</li>
                                <li><strong>Educational Information:</strong> Academic records, transcripts, course enrollments, grades, and related educational data.</li>
                                <li><strong>Payment Information:</strong> Billing address, payment method details processed through secure third-party payment processors.</li>
                                <li><strong>Usage Data:</strong> Information about how you interact with our website, including IP address, browser type, pages visited, and time spent on pages.</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-[#4a3472] mb-4">3. How We Use Your Information</h2>
                            <p className="mb-4">We use the information we collect to:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Process your application and enrollment</li>
                                <li>Provide educational services and course materials</li>
                                <li>Communicate with you about your account and academic progress</li>
                                <li>Process tuition payments and financial aid</li>
                                <li>Improve our website and educational offerings</li>
                                <li>Comply with legal obligations and accreditation requirements</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-[#4a3472] mb-4">4. Information Sharing</h2>
                            <p>
                                We do not sell your personal information. We may share your information with accrediting bodies, government agencies when required by law, service providers who assist in our operations, and with your consent for specific purposes.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-[#4a3472] mb-4">5. Data Security</h2>
                            <p>
                                We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet is 100% secure.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-[#4a3472] mb-4">6. Your Rights</h2>
                            <p className="mb-4">Depending on your location, you may have the right to:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Access the personal information we hold about you</li>
                                <li>Request correction of inaccurate information</li>
                                <li>Request deletion of your information (subject to legal retention requirements)</li>
                                <li>Opt-out of marketing communications</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-[#4a3472] mb-4">7. Cookies</h2>
                            <p>
                                Our website uses cookies to enhance your browsing experience. You can configure your browser to refuse cookies, but some features of our website may not function properly if you do so.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-[#4a3472] mb-4">8. Children&apos;s Privacy</h2>
                            <p>
                                Our services are not directed to individuals under 16 years of age. We do not knowingly collect personal information from children under 16.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-[#4a3472] mb-4">9. Changes to This Policy</h2>
                            <p>
                                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the &quot;Last updated&quot; date.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-[#4a3472] mb-4">10. Contact Us</h2>
                            <p>
                                If you have any questions about this Privacy Policy, please contact us at:
                            </p>
                            <p className="mt-4">
                                <strong>Landmark Christian University</strong><br />
                                Email: info@landmarkchristian.edu<br />
                                Phone: +1 272 458 4332
                            </p>
                        </section>
                    </div>
                </div>
            </main>

            <SiteFooter />
        </div>
    )
}
