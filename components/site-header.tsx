"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger
} from "@/components/ui/sheet"
import { Menu, ChevronDown, X } from "lucide-react"

const navLinks = [
    { href: "/", label: "Home" },
    { href: "/programs", label: "Programs" },
    { href: "/about", label: "About" },
    { href: "/blog", label: "Blog" },
    { href: "/faq", label: "FAQ" },
    { href: "/contact", label: "Contact" },
]

export function SiteHeader() {
    const [open, setOpen] = useState(false)

    return (
        <header className="sticky top-0 z-50 border-b border-gray-100 bg-white">
            <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4">
                <div className="flex items-center gap-8">
                    <Link href="/" className="flex items-center gap-2 py-2">
                        <div className="relative h-14 w-64">
                            <Image
                                src="/images/lcu-logo.png"
                                alt="Landmark Christian University"
                                fill
                                className="object-contain object-left"
                                priority
                            />
                        </div>
                    </Link>
                    <nav className="hidden items-center gap-6 lg:flex">
                        <Link
                            href="/"
                            className="text-sm font-medium text-gray-700 transition-colors hover:text-[#4a3472]"
                        >
                            HOME
                        </Link>
                        <Link
                            href="/programs"
                            className="flex items-center gap-1 text-sm font-medium text-gray-700 transition-colors hover:text-[#4a3472]"
                        >
                            PROGRAMS <ChevronDown className="h-3 w-3" />
                        </Link>
                        <Link
                            href="/about"
                            className="text-sm font-medium text-gray-700 transition-colors hover:text-[#4a3472]"
                        >
                            ABOUT
                        </Link>
                        <Link
                            href="/blog"
                            className="text-sm font-medium text-gray-700 transition-colors hover:text-[#4a3472]"
                        >
                            BLOG
                        </Link>
                        <Link
                            href="/faq"
                            className="text-sm font-medium text-gray-700 transition-colors hover:text-[#4a3472]"
                        >
                            FAQ
                        </Link>
                        <Link
                            href="/contact"
                            className="text-sm font-medium text-gray-700 transition-colors hover:text-[#4a3472]"
                        >
                            CONTACT
                        </Link>
                    </nav>
                </div>
                <div className="flex items-center gap-3">
                    <Link href="/auth/login" className="hidden sm:block">
                        <Button variant="outline" size="sm" className="rounded-full border-[#4a3472] text-[#4a3472] hover:bg-[#4a3472] hover:text-white">
                            Login
                        </Button>
                    </Link>
                    <Link href="/auth/sign-up" className="hidden sm:block">
                        <Button size="sm" className="rounded-full bg-[#d4a843] text-white hover:bg-[#c49935]">
                            Sign Up
                        </Button>
                    </Link>

                    {/* Mobile Menu */}
                    <Sheet open={open} onOpenChange={setOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="lg:hidden" suppressHydrationWarning>
                                <Menu className="h-6 w-6" />
                                <span className="sr-only">Toggle menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-80">
                            <SheetHeader>
                                <SheetTitle className="text-left">
                                    <div className="relative h-10 w-40">
                                        <Image
                                            src="/images/lcu-logo.png"
                                            alt="LCU"
                                            fill
                                            className="object-contain object-left"
                                        />
                                    </div>
                                </SheetTitle>
                            </SheetHeader>
                            <nav className="mt-8 flex flex-col gap-4">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        onClick={() => setOpen(false)}
                                        className="text-lg font-medium text-gray-700 transition-colors hover:text-[#4a3472] py-2 border-b border-gray-100"
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                                <div className="mt-6 flex flex-col gap-3">
                                    <Link href="/auth/login" onClick={() => setOpen(false)}>
                                        <Button variant="outline" className="w-full rounded-full border-[#4a3472] text-[#4a3472]">
                                            Login
                                        </Button>
                                    </Link>
                                    <Link href="/auth/sign-up" onClick={() => setOpen(false)}>
                                        <Button className="w-full rounded-full bg-[#d4a843] text-white hover:bg-[#c49935]">
                                            Sign Up
                                        </Button>
                                    </Link>
                                    <Link href="/apply" onClick={() => setOpen(false)}>
                                        <Button className="w-full rounded-full bg-[#4a3472] text-white hover:bg-[#3a2857]">
                                            Apply Now
                                        </Button>
                                    </Link>
                                </div>
                            </nav>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    )
}
