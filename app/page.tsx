"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { LoginForm } from "@/components/auth/login-form"
import { Dashboard } from "@/components/dashboard/dashboard"

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userPhone, setUserPhone] = useState("")

  useEffect(() => {
    const phone = localStorage.getItem("userPhone")
    if (phone) {
      setIsLoggedIn(true)
      setUserPhone(phone)
    }
  }, [])

  const handleLogin = (phone: string) => {
    setIsLoggedIn(true)
    setUserPhone(phone)
    localStorage.setItem("userPhone", phone)
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setUserPhone("")
    localStorage.removeItem("userPhone")
    localStorage.removeItem("userSubmissions")
  }

  return (
    <div className="min-h-screen flex flex-col relative">
      <Header isLoggedIn={isLoggedIn} onLogout={handleLogout} />
      <main className="flex-1 relative z-10">
        {isLoggedIn ? (
          <Dashboard userPhone={userPhone} />
        ) : (
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-md mx-auto">
              <div className="text-center mb-8">
                <h1 className="text-4xl font-bold gradient-text mb-4">Student Grievance Portal</h1>
                <p className="text-muted-foreground">Submit and track your grievances with ease</p>
              </div>
              <LoginForm onLogin={handleLogin} />
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
