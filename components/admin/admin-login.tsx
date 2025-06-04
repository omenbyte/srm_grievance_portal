"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { Loader2, Shield, User, Lock } from "lucide-react"

interface AdminLoginProps {
  onLogin: (username: string) => void
}

export function AdminLogin({ onLogin }: AdminLoginProps) {
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!credentials.username || !credentials.password) {
      toast.error("Please enter both username and password")
      return
    }

    setLoading(true)

    // Simulate admin authentication
    setTimeout(() => {
      setLoading(false)
      // Demo credentials: admin/admin123
      if (credentials.username === "admin" && credentials.password === "admin123") {
        toast.success("Welcome to the admin dashboard")
        onLogin(credentials.username)
      } else {
        toast.error("Please check your username and password")
      }
    }, 1500)
  }

  return (
    <Card className="w-full max-w-md mx-auto shadow-2xl rounded-2xl border-0 bg-card/90 backdrop-blur-md">
      <CardHeader className="text-center">
        <div className="mx-auto h-12 w-12 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center mb-4">
          <Shield className="h-6 w-6 text-white" />
        </div>
        <CardTitle className="text-2xl font-bold gradient-text">Admin Login</CardTitle>
        <CardDescription>Enter your administrative credentials to access the dashboard</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="username"
                type="text"
                placeholder="Enter admin username"
                value={credentials.username}
                onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                className="pl-10 rounded-xl"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="Enter admin password"
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                className="pl-10 rounded-xl"
                required
              />
            </div>
          </div>
          <Button
            type="submit"
            className="w-full rounded-xl bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Authenticating...
              </>
            ) : (
              "Login to Dashboard"
            )}
          </Button>
        </form>
        <p className="text-xs text-center text-muted-foreground mt-4">
          Demo credentials: <span className="font-mono font-bold">admin / admin123</span>
        </p>
      </CardContent>
    </Card>
  )
}
