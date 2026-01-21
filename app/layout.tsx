import type React from "react"
import type { Metadata, Viewport } from "next"
import "./globals.css"
import { DevRoleSwitcher } from "@/components/dev/role-switcher"


export const metadata: Metadata = {
  title: {
    default: "Landmark Christian University",
    template: "%s | Landmark Christian University",
  },
  description:
    "Pursue your God-given purpose with flexible, self-paced online degree programs rooted in biblical truth and academic excellence at Landmark Christian University.",
  keywords: [
    "Christian university",
    "online education",
    "biblical studies",
    "theology",
    "ministry training",
    "accredited Christian college",
    "self-paced learning",
    "Master of Divinity",
    "Christian counseling",
  ],
  authors: [{ name: "Landmark Christian University" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Landmark Christian University",
    title: "Landmark Christian University - Transforming Lives Through Faith",
    description: "Flexible, self-paced online degree programs rooted in biblical truth and academic excellence.",
  },
  manifest: "/manifest.json",
  generator: "v0.app",
}

export const viewport: Viewport = {
  themeColor: "#1e3a5f",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        {children}
        {process.env.NODE_ENV === 'development' && <DevRoleSwitcher />}
      </body>
    </html>
  )
}
