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
            <div className="mx-auto flex h-20 max-w-7xl items-center px-6 md:px-12 relative">
                {/* Left: Navigation Menu */}
                <div className="flex-1 flex items-center">
                    <nav className="hidden items-center gap-6 lg:flex">
                        <Link
                            href="/"
                            className="text-sm font-medium text-gray-700 transition-colors hover:text-[#261642]"
                        >
                            HOME
                        </Link>
                        <Link
                            href="/programs"
                            className="flex items-center gap-1 text-sm font-medium text-gray-700 transition-colors hover:text-[#261642]"
                        >
                            PROGRAMS <ChevronDown className="h-3 w-3" />
                        </Link>
                        <Link
                            href="/about"
                            className="text-sm font-medium text-gray-700 transition-colors hover:text-[#261642]"
                        >
                            ABOUT
                        </Link>
                        <Link
                            href="/blog"
                            className="text-sm font-medium text-gray-700 transition-colors hover:text-[#261642]"
                        >
                            BLOG
                        </Link>
                        <Link
                            href="/faq"
                            className="text-sm font-medium text-gray-700 transition-colors hover:text-[#261642]"
                        >
                            FAQ
                        </Link>
                        <Link
                            href="/contact"
                            className="text-sm font-medium text-gray-700 transition-colors hover:text-[#261642]"
                        >
                            CONTACT
                        </Link>
                    </nav>
                    {/* Mobile Menu Trigger - only visible on small screens */}
                    <div className="lg:hidden">
                        <Sheet open={open} onOpenChange={setOpen}>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" suppressHydrationWarning>
                                    <Menu className="h-6 w-6" />
                                    <span className="sr-only">Toggle menu</span>
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="w-80">
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
                                            <Button className="w-full rounded-full bg-[#261642] text-white hover:bg-[#1a0f2e]">
                                                Apply Now
                                            </Button>
                                        </Link>
                                    </div>
                                </nav>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>

                {/* Center: Logo */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                    <Link href="/" className="flex items-center py-2">
                        <div className="relative h-14 w-48 md:w-64">
                            <Image
                                src="/images/lcu-logo.png"
                                alt="Landmark Christian University"
                                fill
                                className="object-contain"
                                priority
                            />
                        </div>
                    </Link>
                </div>

                {/* Right: Auth Buttons */}
                <div className="flex-1 flex items-center justify-end gap-3">
                    <Link href="/auth/login" className="hidden sm:block">
                        <Button variant="outline" size="sm" className="rounded-full border-[#261642] text-[#261642] hover:bg-[#261642] hover:text-white">
                            Login
                        </Button>
                    </Link>
                    <Link href="/auth/sign-up" className="hidden sm:block">
                        <Button size="sm" className="rounded-full bg-[#d4a843] text-white hover:bg-[#c49935]">
                            Sign Up
                        </Button>
                    </Link>
                    {/* Mobile Login Icon - optional if buttons are hidden */}
                    <Link href="/auth/login" className="sm:hidden text-[#261642]">
                        <Button variant="ghost" size="icon">
                            <X className="h-6 w-6 hidden" /> {/* Just to keep layout consistent if needed */}
                            <span className="text-xs font-bold">LOGIN</span>
                        </Button>
                    </Link>
                </div>
            </div>
        </header>
    )
}
