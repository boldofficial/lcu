import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

export const metadata = {
    title: "Terms and Conditions",
    description: "Terms and Conditions for Landmark Christian University",
}

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-white">
            <SiteHeader />

            <main className="py-16 lg:py-24">
                <div className="mx-auto max-w-4xl px-6 md:px-12">
                    <h1 className="text-4xl font-bold text-[#4a3472] mb-8">Terms and Conditions</h1>

                    <div className="prose prose-lg max-w-none text-gray-600">
                        <p className="text-sm text-muted-foreground mb-8">
                            Last updated: January 2025
                        </p>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-[#4a3472] mb-4">1. Acceptance of Terms</h2>
                            <p>
                                By accessing and using the Landmark Christian University website and services, you accept and agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our services.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-[#4a3472] mb-4">2. Educational Services</h2>
                            <p>
                                Landmark Christian University provides online Christian education programs. All academic programs are subject to the university&apos;s academic policies, catalog, and student handbook, which are incorporated by reference into these terms.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-[#4a3472] mb-4">3. User Accounts</h2>
                            <p>
                                When you create an account with us, you must provide accurate, complete, and current information. You are responsible for safeguarding your password and for all activities that occur under your account.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-[#4a3472] mb-4">4. Tuition and Fees</h2>
                            <p>
                                All tuition and fees are subject to change. Students are responsible for paying all applicable tuition and fees by the published due dates. Refund policies are outlined in the university catalog.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-[#4a3472] mb-4">5. Academic Integrity</h2>
                            <p>
                                Students are expected to maintain the highest standards of academic integrity. Plagiarism, cheating, and other forms of academic dishonesty are prohibited and may result in disciplinary action, including dismissal.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-[#4a3472] mb-4">6. Intellectual Property</h2>
                            <p>
                                All content on this website, including text, graphics, logos, images, and course materials, is the property of Landmark Christian University and is protected by copyright and intellectual property laws.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-[#4a3472] mb-4">7. Limitation of Liability</h2>
                            <p>
                                Landmark Christian University shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of our services or any content provided therein.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-[#4a3472] mb-4">8. Changes to Terms</h2>
                            <p>
                                We reserve the right to modify these terms at any time. We will notify users of any material changes by posting the new terms on this page. Your continued use of the service after such modifications constitutes acceptance of the updated terms.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-[#4a3472] mb-4">9. Contact Information</h2>
                            <p>
                                If you have any questions about these Terms and Conditions, please contact us at:
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
