"use client"

import { useState, useEffect } from "react"
import { AdminLogin } from "@/components/admin/admin-login"
import { AdminDashboard } from "@/components/admin/admin-dashboard"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"

export default function AdminPage() {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false)
  const [adminUser, setAdminUser] = useState("")

  useEffect(() => {
    const adminSession = localStorage.getItem("adminSession")
    if (adminSession) {
      const session = JSON.parse(adminSession)
      if (session.expiresAt > Date.now()) {
        setIsAdminLoggedIn(true)
        setAdminUser(session.username)
      } else {
        localStorage.removeItem("adminSession")
      }
    }
  }, [])

  const handleAdminLogin = (username: string) => {
    setIsAdminLoggedIn(true)
    setAdminUser(username)
    // Set session to expire in 8 hours
    const session = {
      username,
      expiresAt: Date.now() + 8 * 60 * 60 * 1000,
    }
    localStorage.setItem("adminSession", JSON.stringify(session))
  }

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false)
    setAdminUser("")
    localStorage.removeItem("adminSession")
  }

  return (
    <div className="min-h-screen flex flex-col relative">
      <Header isLoggedIn={false} onLogout={() => {}} />
      <main className="flex-1 relative z-10">
        {isAdminLoggedIn ? (
          <AdminDashboard adminUser={adminUser} onLogout={handleAdminLogout} />
        ) : (
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-md mx-auto">
              <div className="text-center mb-8">
                <h1 className="text-4xl font-bold gradient-text mb-4">Admin Portal</h1>
                <p className="text-muted-foreground">Access the administrative dashboard</p>
              </div>
              <AdminLogin onLogin={handleAdminLogin} />
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
