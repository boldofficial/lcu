"use client"

import Link from "next/link"
import Image from "next/image"
import { Facebook, Twitter, Instagram, MapPin, Phone, Mail } from "lucide-react"

export function SiteFooter() {
    return (
        <footer className="bg-[#1a0f2e] py-16 text-white">
            <div className="mx-auto max-w-7xl px-6 md:px-12">
                <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-5">
                    {/* Logo */}
                    <div className="lg:col-span-1">
                        <div className="mb-6">
                            <Link href="/">
                                <div className="relative h-16 w-full max-w-[240px]">
                                    <Image
                                        src="/images/lcu-white-logo.png"
                                        alt="Landmark Christian University"
                                        fill
                                        className="object-contain object-left"
                                        priority
                                    />
                                </div>
                            </Link>
                        </div>
                        <p className="text-sm text-white leading-relaxed">
                            Empowering Christian leaders through
                            Christ-centered education across the
                            globe.
                        </p>
                        <div className="mt-6 flex gap-4">
                            <a href="https://facebook.com/lcuniversity" target="_blank" rel="noopener noreferrer" className="text-white hover:text-[#d4a843] transition-colors">
                                <Facebook className="h-5 w-5" />
                            </a>
                            <a href="https://twitter.com/lcuniversity" target="_blank" rel="noopener noreferrer" className="text-white hover:text-[#d4a843] transition-colors">
                                <Twitter className="h-5 w-5" />
                            </a>
                            <a href="https://instagram.com/lcuniversity" target="_blank" rel="noopener noreferrer" className="text-white hover:text-[#d4a843] transition-colors">
                                <Instagram className="h-5 w-5" />
                            </a>
                        </div>
                    </div>
                    {/* Quick Link */}
                    <div>
                        <h4 className="font-bold text-lg text-white mb-6">Quick Link</h4>
                        <ul className="space-y-3 text-sm text-white">
                            <li><Link href="/about" className="hover:text-[#d4a843] transition-colors">About Us</Link></li>
                            <li><Link href="/programs" className="hover:text-[#d4a843] transition-colors">Academics</Link></li>
                            <li><Link href="/apply" className="hover:text-[#d4a843] transition-colors">Admissions</Link></li>
                            <li><Link href="/faq" className="hover:text-[#d4a843] transition-colors">FAQ</Link></li>
                            <li><Link href="/contact" className="hover:text-[#d4a843] transition-colors">Contact</Link></li>
                            <li><Link href="/auth/login" className="hover:text-[#d4a843] transition-colors">Student Portal</Link></li>
                        </ul>
                    </div>
                    {/* Programs */}
                    <div>
                        <h4 className="font-bold text-lg text-white mb-6">Programs</h4>
                        <ul className="space-y-3 text-sm text-white">
                            <li><Link href="/programs" className="hover:text-[#d4a843] transition-colors">Bachelor&apos;s Degrees</Link></li>
                            <li><Link href="/programs" className="hover:text-[#d4a843] transition-colors">Master&apos;s Degrees</Link></li>
                            <li><Link href="/programs" className="hover:text-[#d4a843] transition-colors">Doctoral Degrees</Link></li>
                            <li><Link href="/programs" className="hover:text-[#d4a843] transition-colors">Certificate Programs</Link></li>
                            <li><Link href="/programs" className="hover:text-[#d4a843] transition-colors">Dual Degree Programs</Link></li>
                        </ul>
                    </div>
                    {/* Directors */}
                    <div>
                        <h4 className="font-bold text-lg text-white mb-6">Directors</h4>
                        <ul className="space-y-3 text-sm text-white">
                            <li className="flex items-start gap-3">
                                <MapPin className="h-5 w-5 mt-0.5 shrink-0 text-[#d4a843]" />
                                <span>1820 St. Marks 56, Largo<br />United States</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <MapPin className="h-5 w-5 mt-0.5 shrink-0 text-[#d4a843]" />
                                <span>390 Oyemi Street, Los Angeles<br />United States</span>
                            </li>
                        </ul>
                    </div>
                    {/* Contacts */}
                    <div>
                        <h4 className="font-bold text-lg text-white mb-6">Contacts</h4>
                        <ul className="space-y-3 text-sm text-white">
                            <li className="flex items-center gap-3">
                                <Phone className="h-4 w-4 shrink-0 text-[#d4a843]" />
                                <span>+1 272 458 4332</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone className="h-4 w-4 shrink-0 text-[#d4a843]" />
                                <span>+1 272 765 8888</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail className="h-4 w-4 shrink-0 text-[#d4a843]" />
                                <span>info@landmarkchristian.edu</span>
                            </li>
                        </ul>
                    </div>
                </div>
                <div className="mt-16 border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-white">
                    <p>&copy; {new Date().getFullYear()} Landmark Christian University All Rights Reserved.</p>
                    <p>
                        Designed and Developed by{" "}
                        <a
                            href="https://www.getboldideas.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#d4a843] hover:underline"
                        >
                            Bold Ideas Innovations Ltd.
                        </a>
                    </p>
                    <div className="flex gap-6">
                        <Link href="/terms" className="hover:text-[#d4a843] transition-colors">Terms and Conditions</Link>
                        <Link href="/privacy" className="hover:text-[#d4a843] transition-colors">Privacy Policy</Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}
