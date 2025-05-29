"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Phone, Shield } from "lucide-react"
import { toast } from "sonner"

interface LoginFormProps {
  onLogin: (phone: string) => void  
}

export function LoginForm({ onLogin }: LoginFormProps) {
  const [phone, setPhone] = useState("")
  const [otp, setOtp] = useState("")
  const [step, setStep] = useState<"phone" | "otp">("phone")
  const [loading, setLoading] = useState(false)

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!/^[6-9]\d{9}$/.test(phone)) {
      toast.error("Invalid Phone Number", {
        description: "Please enter a valid 10-digit mobile number",
      })
      return
    }

    setLoading(true)

    // Simulate OTP sending
    setTimeout(() => {
      setLoading(false)
      setStep("otp")
      toast.success("OTP Sent", {
        description: `Verification code sent to +91 ${phone}`,
      })
    }, 2000)
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()

    if (otp.length !== 6) {
      toast.error("Invalid OTP", {
        description: "Please enter a valid 6-digit OTP",
      })
      return
    }

    setLoading(true)

    // Simulate OTP verification
    setTimeout(() => {
      setLoading(false)
      if (otp === "123456") {
        toast.success("Login Successful",{
          description: "Welcome to the Student Grievance Portal",
        })
        onLogin(phone)
      } else {
        toast.error("Invalid OTP",{
          description: "Please check your OTP and try again",
        })
      }
    }, 1500)
  }

  return (
    <Card className="w-full max-w-md mx-auto shadow-2xl rounded-2xl border-0 bg-card/90 backdrop-blur-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold gradient-text">
          {step === "phone" ? "Login with Phone" : "Verify OTP"}
        </CardTitle>
        <CardDescription>
          {step === "phone" ? "Enter your mobile number to receive OTP" : `Enter the 6-digit code sent to +91 ${phone}`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {step === "phone" ? (
          <form onSubmit={handleSendOTP} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Mobile Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Enter 10-digit mobile number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  className="pl-10 rounded-xl"
                  required
                />
              </div>
            </div>
            <Button
              type="submit"
              className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              disabled={loading || phone.length !== 10}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending OTP...
                </>
              ) : (
                "Send OTP"
              )}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="otp">Verification Code</Label>
              <div className="relative">
                <Shield className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="otp"
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  className="pl-10 rounded-xl text-center text-lg tracking-widest"
                  required
                />
              </div>
            </div>
            <div className="flex space-x-2">
              <Button type="button" variant="outline" className="flex-1 rounded-xl" onClick={() => setStep("phone")}>
                Back
              </Button>
              <Button
                type="submit"
                className="flex-1 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                disabled={loading || otp.length !== 6}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify & Login"
                )}
              </Button>
            </div>
            <p className="text-xs text-center text-muted-foreground">
              Use OTP: <span className="font-mono font-bold">123456</span> for demo
            </p>
          </form>
        )}
      </CardContent>
    </Card>
  )
}
