"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { GrievanceForm } from "@/components/forms/grievance-form"
import { PastSubmissions } from "@/components/dashboard/past-submissions"
import { Plus, FileText, Clock, CheckCircle } from "lucide-react"

interface Submission {
  id: string
  firstName: string
  lastName: string
  issueType: string
  message: string
  submittedAt: string
  status: "pending" | "in-progress" | "resolved"
}

interface DashboardProps {
  userPhone: string
}

export function Dashboard({ userPhone }: DashboardProps) {
  const [showForm, setShowForm] = useState(false)
  const [submissions, setSubmissions] = useState<Submission[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("userSubmissions")
      return saved ? JSON.parse(saved) : []
    }
    return []
  })

  const handleFormSuccess = (newSubmission: Submission) => {
    const updatedSubmissions = [...submissions, newSubmission]
    setSubmissions(updatedSubmissions)
    localStorage.setItem("userSubmissions", JSON.stringify(updatedSubmissions))
    setShowForm(false)
  }

  const canSubmit = () => {
    const lastSubmission = submissions[submissions.length - 1]
    if (!lastSubmission) return true

    const lastSubmissionTime = new Date(lastSubmission.submittedAt)
    const now = new Date()
    const hoursDiff = (now.getTime() - lastSubmissionTime.getTime()) / (1000 * 60 * 60)

    return hoursDiff >= 24
  }

  if (showForm) {
    return (
      <div className="container mx-auto px-4 py-8">
        <GrievanceForm userPhone={userPhone} onSuccess={handleFormSuccess} onCancel={() => setShowForm(false)} />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold gradient-text mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Manage your grievances and track their status</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <Card className="rounded-2xl shadow-lg border-0 bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <span>Total Submissions</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{submissions.length}</div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-lg border-0 bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              <span>Pending</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
              {submissions.filter((s) => s.status === "pending").length}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-lg border-0 bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              <span>Resolved</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
              {submissions.filter((s) => s.status === "resolved").length}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="rounded-2xl shadow-lg border-0 bg-card/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="gradient-text">Submit New Grievance</CardTitle>
            <CardDescription>
              {canSubmit()
                ? "Submit a new grievance to get your issues resolved"
                : "You can submit a new grievance after 24 hours from your last submission"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => setShowForm(true)}
              disabled={!canSubmit()}
              className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Plus className="mr-2 h-4 w-4" />
              {canSubmit() ? "New Grievance" : "Wait 24 Hours"}
            </Button>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-lg border-0 bg-card/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="gradient-text">Quick Stats</CardTitle>
            <CardDescription>Your grievance submission overview</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Last Submission</span>
              <span className="text-sm font-medium">
                {submissions.length > 0
                  ? new Date(submissions[submissions.length - 1].submittedAt).toLocaleDateString()
                  : "None"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Response Rate</span>
              <span className="text-sm font-medium">
                {submissions.length > 0
                  ? `${Math.round((submissions.filter((s) => s.status !== "pending").length / submissions.length) * 100)}%`
                  : "N/A"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {submissions.length > 0 && (
        <div className="mt-8">
          <PastSubmissions submissions={submissions} />
        </div>
      )}
    </div>
  )
}
