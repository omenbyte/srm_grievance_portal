"use client"

import { useState, useEffect } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { GrievanceForm } from "@/components/forms/grievance-form"
import { PastSubmissions } from "@/components/dashboard/past-submissions"
import { GrievanceStats } from "@/components/dashboard/grievance-stats"
import { Plus, FileText, Clock, CheckCircle, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Database } from "@/lib/types/supabase"

interface Submission {
  id: string
  ticket_number: string
  issueType: string
  message: string
  submittedAt: string
  status: "pending" | "in-progress" | "resolved"
  sub_category?: string
  location_details?: string | null
  image_url?: string | null
}

interface GrievanceForm {
  id: string
  ticket_number: string
  issue_type: string
  sub_category: string
  location_details: string | null
  message: string
  image_url: string | null
  submitted_at: string
  status: "pending" | "in-progress" | "resolved"
  user: {
    first_name: string | null
    last_name: string | null
    reg_number: string
    email: string
    phone: string
  }
}

interface DashboardProps {
  userPhone: string
}

interface Stats {
  total: number
  pending: number
  resolved: number
  inProgress: number
  critical: number
}

interface FormSubmission {
  id: string
  ticket_number: string
  issueType: string
  message: string
  submittedAt: string
  status: "pending" | "in-progress" | "resolved"
  sub_category?: string
  location_details?: string | null
  image_url?: string | null
}

export function Dashboard({ userPhone }: DashboardProps) {
  const [showForm, setShowForm] = useState(false)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [stats, setStats] = useState<Stats>({
    total: 0,
    pending: 0,
    resolved: 0,
    inProgress: 0,
    critical: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const loadData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/grievance?phone=${userPhone}`)
      if (!response.ok) {
        throw new Error("Failed to fetch data")
      }
      const data = await response.json()
      console.log('API Response:', data)

      if (data.grievances) {
        const mappedGrievances = data.grievances.map((g: any) => {
          return {
            id: g.id,
            ticket_number: g.ticket_number,
            issueType: g.issue_type,
            sub_category: g.sub_category,
            location_details: g.location_details,
            message: g.message,
            image_url: g.image_url,
            submittedAt: g.submitted_at,
            status: g.status.toLowerCase()
          }
        })
        setSubmissions(mappedGrievances)

        const total = mappedGrievances.length
        const pending = mappedGrievances.filter((s: Submission) => s.status === "pending").length
        const resolved = mappedGrievances.filter((s: Submission) => s.status === "resolved").length
        const inProgress = mappedGrievances.filter((s: Submission) => s.status === "in-progress").length
        
        // Calculate critical grievances (pending for more than 3 days)
        const critical = mappedGrievances.filter((s: Submission) => {
          if (s.status !== "pending") return false
          const submittedDate = new Date(s.submittedAt)
          const daysDiff = Math.floor((Date.now() - submittedDate.getTime()) / (1000 * 60 * 60 * 24))
          return daysDiff > 3
        }).length

        setStats({ total, pending, resolved, inProgress, critical })
      }
    } catch (error) {
      console.error('Error loading data:', error)
      setError(error instanceof Error ? error.message : "Failed to load data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [userPhone])

  const handleFormSuccess = (submission: FormSubmission) => {
    const newSubmission: Submission = {
      id: submission.id,
      ticket_number: submission.ticket_number,
      issueType: submission.issueType,
      sub_category: submission.sub_category,
      location_details: submission.location_details,
      message: submission.message,
      image_url: submission.image_url,
      submittedAt: submission.submittedAt,
      status: submission.status,
    }
    setSubmissions((prev) => [newSubmission, ...prev])
    setShowForm(false)
  }

  const canSubmit = () => {
    if (submissions.length === 0) return true
    const lastSubmission = submissions[submissions.length - 1]
    const lastSubmissionDate = new Date(lastSubmission.submittedAt)
    const now = new Date()
    const hoursSinceLastSubmission =
      (now.getTime() - lastSubmissionDate.getTime()) / (1000 * 60 * 60)
    return hoursSinceLastSubmission >= 24
  }

  const handleNewSubmission = async (submission: Submission) => {
    setSubmissions((prev) => [...prev, submission])
    await loadData()
  }

  if (showForm) {
    return (
      <div className="container mx-auto px-4 py-8">
        <GrievanceForm
          userPhone={userPhone}
          onSuccess={handleFormSuccess}
          onCancel={() => setShowForm(false)}
        />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold gradient-text mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Manage your grievances and track their status
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 mb-8">
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
                  ? new Date(
                      submissions[submissions.length - 1].submittedAt
                    ).toLocaleDateString()
                  : "None"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Response Rate</span>
              <span className="text-sm font-medium">
                {submissions.length > 0
                  ? `${Math.round(
                      (submissions.filter((s) => s.status !== "pending").length /
                        submissions.length) *
                        100
                    )}%`
                  : "N/A"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <GrievanceStats stats={stats} />

      <PastSubmissions submissions={submissions} />
    </div>
  )
}
