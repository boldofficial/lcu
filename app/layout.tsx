import type React from "react"
import type { Metadata, Viewport } from "next"
import "./globals.css"
import { DevRoleSwitcher } from "@/components/dev/role-switcher"


export const metadata: Metadata = {
  title: {
    default: "Landmark Christian University | Accredited Online Degrees for Kingdom Leaders",
    template: "%s | Landmark Christian University",
  },
  description:
    "Empowering Kingdom leaders through Christ-centered education. Join Landmark Christian University for 100% online, flexible, and accredited degrees in Theology, Ministry, Counseling, and Business.",
  keywords: [
    "Christian university online",
    "accredited theological degrees",
    "online ministry training",
    "biblical studies degree",
    "Christian leadership university",
    "flexible theological education",
    "LCU online",
    "Kingdom leaders education",
  ],
  authors: [{ name: "Landmark Christian University" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://landmarkchristian.edu",
    siteName: "Landmark Christian University",
    title: "Landmark Christian University | Empowering Kingdom Leaders",
    description: "Earn your accredited degree in Theology, Ministry, or Business 100% online. Flexible learning designed for your calling.",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "Landmark Christian University Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Landmark Christian University | Online Christian Education",
    description: "Flexible, accredited online degrees in Theology, Ministry, and Leadership.",
    images: ["/opengraph-image.png"],
  },
  manifest: "/manifest.json",
  generator: "v0.app",
}

export const viewport: Viewport = {
  themeColor: "#261642",
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
