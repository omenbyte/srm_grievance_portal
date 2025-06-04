"use client"

import type React from "react"

import { useState, useEffect } from "react"
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
  const [resendTimer, setResendTimer] = useState(0)
  const [canResend, setCanResend] = useState(false)

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (resendTimer > 0) {
      timer = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [resendTimer])

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!/^[6-9]\d{9}$/.test(phone)) {
      toast.error("Invalid Phone Number", {
        description: "Please enter a valid 10-digit mobile number",
      })
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: `+91${phone}` // Convert to E.164 format
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send OTP')
      }

      setStep("otp")
      setResendTimer(60)
      setCanResend(false)
      toast.success("OTP Sent", {
        description: `Verification code sent to +91 ${phone}`,
      })
    } catch (error) {
      toast.error("Error", {
        description: error instanceof Error ? error.message : 'Failed to send OTP',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleResendOTP = async () => {
    if (!canResend) return

    setLoading(true)
    try {
      const response = await fetch('/api/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: `+91${phone}`
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to resend OTP')
      }

      setResendTimer(60)
      setCanResend(false)
      toast.success("OTP Resent", {
        description: `New verification code sent to +91 ${phone}`,
      })
    } catch (error) {
      toast.error("Error", {
        description: error instanceof Error ? error.message : 'Failed to resend OTP',
      })
    } finally {
      setLoading(false)
    }
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

    try {
      const response = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: `+91${phone}`,
          code: otp
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Invalid OTP')
      }

      toast.success("Login Successful", {
        description: "Welcome to the Student Grievance Portal",
      })
      onLogin(phone)
    } catch (error) {
      toast.error("Error", {
        description: error instanceof Error ? error.message : 'Invalid OTP',
      })
    } finally {
      setLoading(false)
    }
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
            <div className="text-center">
              {resendTimer > 0 ? (
                <p className="text-sm text-muted-foreground">
                  Resend OTP in {resendTimer} seconds
                </p>
              ) : (
                <Button
                  type="button"
                  variant="link"
                  className="text-sm"
                  onClick={handleResendOTP}
                  disabled={!canResend || loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Resending...
                    </>
                  ) : (
                    "Resend OTP"
                  )}
                </Button>
              )}
            </div>
            <p className="text-xs text-center text-muted-foreground">
              For use by <span className="font-mono font-bold">SRM IST, Delhi NCR</span> students only
            </p>
          </form>
        )}
      </CardContent>
    </Card>
  )
}
