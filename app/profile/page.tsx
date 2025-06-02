"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { ProfileDetails } from "@/components/profile/profile-details"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"

interface UserProfile {
  firstName: string
  lastName: string
  mobile: string
  registrationNo: string
  email: string
}

export default function ProfilePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in
    const phone = localStorage.getItem("userPhone")
    if (!phone) {
      router.push("/")
      return
    }

    setIsLoggedIn(true)

    // Get user profile from localStorage or use dummy data
    const submissions = localStorage.getItem("userSubmissions")
    if (submissions) {
      const parsedSubmissions = JSON.parse(submissions)
      if (parsedSubmissions.length > 0) {
        const latestSubmission = parsedSubmissions[parsedSubmissions.length - 1]
        setUserProfile({
          firstName: latestSubmission.firstName || "John",
          lastName: latestSubmission.lastName || "Doe",
          mobile: latestSubmission.mobile || phone,
          registrationNo: latestSubmission.registrationNo || "RA2211003010521",
          email: latestSubmission.email || "john.doe@srmist.edu.in",
        })
        return
      }
    }

    // Use dummy data if no submissions found
    setUserProfile({
      firstName: "John",
      lastName: "Doe",
      mobile: phone,
      registrationNo: "RA2211003010521",
      email: "john.doe@srmist.edu.in",
    })
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
