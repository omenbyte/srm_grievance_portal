"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { LoginForm } from "@/components/auth/login-form"
import { Dashboard } from "@/components/dashboard/dashboard"
import { AdminDashboard } from "@/components/admin/admin-dashboard"
import { PlatformAdvantages } from "@/components/home/advantages"
import { createClient } from "@/lib/supabase/client"

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userPhone, setUserPhone] = useState("")
  const [isAdmin, setIsAdmin] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        setIsLoggedIn(true)
        setUserPhone(session.user.phone || "")
        // Check if user is admin
        checkAdminStatus(session.user.phone || "")
      }
    }

    checkSession()
  }, [])

  const checkAdminStatus = async (phone: string) => {
    try {
      // Format phone number to match database format
      const formattedPhone = phone.startsWith('+91') ? phone : `+91${phone}`

      const response = await fetch(`/api/admin/check-status?phone=${encodeURIComponent(formattedPhone)}`)
      const data = await response.json()

      setIsAdmin(data.isAdmin)
      localStorage.setItem("userRole", data.isAdmin ? "admin" : "student")
    } catch (error) {
      console.error('Error checking admin status:', error)
      setIsAdmin(false)
      localStorage.setItem("userRole", "student")
    }
  }

  const handleLogin = async (phone: string) => {
    setIsLoggedIn(true)
    setUserPhone(phone)
    localStorage.setItem("userPhone", phone)
    // Check admin status after login
    await checkAdminStatus(phone)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setIsLoggedIn(false)
    setUserPhone("")
    setIsAdmin(false)
    localStorage.removeItem("userPhone")
    localStorage.removeItem("userSubmissions")
    localStorage.removeItem("userRole")
  }

  return (
    <div className="min-h-screen flex flex-col relative">
      <Header isLoggedIn={isLoggedIn} onLogout={handleLogout} isAdmin={isAdmin} />
      <main className="flex-1 relative z-10">
        {isLoggedIn ? (
          isAdmin ? (
            <AdminDashboard adminUser="Admin" onLogout={handleLogout} />
          ) : (
            <Dashboard userPhone={userPhone} />
          )
        ) : (
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-md mx-auto">
              <div className="text-center mb-8">
                <h1 className="text-4xl font-bold gradient-text mb-4">Student Grievance Portal</h1>
                <p className="text-muted-foreground">Submit and track your grievances with ease</p>
              </div>
              <LoginForm onLogin={handleLogin} />
            </div>
            <PlatformAdvantages />
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
