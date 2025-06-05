"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { ProfileDetails } from "@/components/profile/profile-details"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

interface UserProfile {
  firstName: string
  lastName: string
  mobile: string
  reg_number: string
  email: string
}

export default function ProfilePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // Check if user is logged in
    const phone = localStorage.getItem("userPhone")
    if (!phone) {
      router.push("/")
      return
    }

    setIsLoggedIn(true)

    // Fetch user data from Supabase
    const fetchUserData = async () => {
      try {
        // Format phone number to match database format
        const formattedPhone = phone.startsWith('+91') ? phone : `+91${phone}`

        const { data: user, error } = await supabase
          .from('users')
          .select('first_name, last_name, reg_number, email, phone')
          .eq('phone', formattedPhone)
          .single()

        if (error) {
          throw error
        }

        if (user) {
          setUserProfile({
            firstName: user.first_name || "Fill Grievance Form",
            lastName: user.last_name || "Fill Grievance Form",
            mobile: user.phone || phone,
            reg_number: user.reg_number || "Fill Grievance Form",
            email: user.email || "Fill Grievance Form",
          })
        } else {
          // Use default values if no user found
          setUserProfile({
            firstName: "Fill Grievance Form",
            lastName: "Fill Grievance Form",
            mobile: phone,
            reg_number: "Fill Grievance Form",
            email: "Fill Grievance Form",
          })
        }
      } catch (error) {
        // Use default values if there's an error
        setUserProfile({
          firstName: "Fill Grievance Form",
          lastName: "Fill Grievance Form",
          mobile: phone,
          reg_number: "Fill Grievance Form",
          email: "Fill Grievance Form",
        })
      }
    }

    fetchUserData()
  }, [router])

  const handleLogout = () => {
    setIsLoggedIn(false)
    localStorage.removeItem("userPhone")
    localStorage.removeItem("userSubmissions")
    router.push("/")
  }

  if (!isLoggedIn || !userProfile) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen flex flex-col relative">
      <Header isLoggedIn={isLoggedIn} onLogout={handleLogout} />
      <main className="flex-1 relative z-10">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold gradient-text mb-4">My Profile</h1>
              <p className="text-muted-foreground">To change your profile details, please fill the contact form</p>
            </div>

            <Card className="rounded-2xl shadow-2xl border-0 bg-card/80 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="gradient-text">Personal Information</CardTitle>
                <CardDescription>Your account details and contact information</CardDescription>
              </CardHeader>
              <CardContent>
                <ProfileDetails profile={userProfile} />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
