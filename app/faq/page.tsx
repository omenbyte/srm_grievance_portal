"use client"

import { useState } from "react"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { FaqList } from "@/components/faq/faq-list"
import { faqData } from "@/lib/constants"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

export default function FaqPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    if (typeof window !== "undefined") {
      return !!localStorage.getItem("userPhone")
    }
    return false
  })

  const [searchQuery, setSearchQuery] = useState("")

  const handleLogout = () => {
    setIsLoggedIn(false)
    localStorage.removeItem("userPhone")
    localStorage.removeItem("userSubmissions")
    window.location.href = "/"
  }

  const filteredFaqs = faqData.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="min-h-screen flex flex-col relative">
      <Header isLoggedIn={isLoggedIn} onLogout={handleLogout} />
      <main className="flex-1 relative z-10">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold gradient-text mb-4">Frequently Asked Questions</h1>
              <p className="text-muted-foreground">Find answers to common questions about the grievance portal</p>
            </div>

            <div className="mb-8 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search FAQs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 rounded-xl"
              />
            </div>

            <Card className="rounded-2xl shadow-2xl border-0 bg-card/80 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="gradient-text">Common Questions</CardTitle>
                <CardDescription>Browse through our frequently asked questions to find quick answers</CardDescription>
              </CardHeader>
              <CardContent>
                <FaqList faqs={filteredFaqs} />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
