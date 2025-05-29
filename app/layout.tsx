import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/ThemeProvider"
import { Toaster } from "@/components/ui/sonner"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Student Grievance Portal",
  description: "Submit and track your grievances easily",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange={false}>
          <div className="animated-background">
            <div className="grid-pattern"></div>
            <div className="gradient-overlay"></div>
            <div className="floating-shapes">
              <div className="shape"></div>
              <div className="shape"></div>
              <div className="shape"></div>
              <div className="shape"></div>
              <div className="shape"></div>
            </div>
          </div>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
