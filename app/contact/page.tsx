"use client"

import { useState } from "react"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { ContactForm } from "@/components/contact/contact-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, Phone, MapPin } from "lucide-react"

export default function ContactPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    if (typeof window !== "undefined") {
      return !!localStorage.getItem("userPhone")
    }
    return false
  })

  const handleLogout = () => {
    setIsLoggedIn(false)
    localStorage.removeItem("userPhone")
    localStorage.removeItem("userSubmissions")
    window.location.href = "/"
  }

  return (
    <div className="min-h-screen flex flex-col relative">
      <Header isLoggedIn={isLoggedIn} onLogout={handleLogout} />
      <main className="flex-1 relative z-10">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold gradient-text mb-4">Contact Us</h1>
              <p className="text-muted-foreground">
                Get in touch with our technical support team for any issues with the platform
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <Card className="rounded-2xl shadow-lg border-0 bg-card/80 backdrop-blur-md">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
                    <Mail className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="font-medium mb-2">Email</h3>
                  <p className="text-muted-foreground">director.ncr@srmist.edu.in</p>
                </CardContent>
              </Card>

              {/* <Card className="rounded-2xl shadow-lg border-0 bg-card/80 backdrop-blur-md">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-4">
                    <Phone className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="font-medium mb-2">Phone</h3>
                  <p className="text-muted-foreground">+91 1800-102-1525</p>
                </CardContent>
              </Card> */}

              <Card className="rounded-2xl shadow-lg border-0 bg-card/80 backdrop-blur-md">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
                    <MapPin className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="font-medium mb-2">Address</h3>
                  <p className="text-muted-foreground">SRM Institute of Science and Technology, Delhi NCR</p>
                </CardContent>
              </Card>
            </div>

            <Card className="rounded-2xl shadow-2xl border-0 bg-card/80 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="gradient-text">Technical Support Form</CardTitle>
                <CardDescription>
                  This form is only for technical issues with the platform. For grievances, please use the grievance
                  form after logging in.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ContactForm />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
