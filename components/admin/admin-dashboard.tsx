"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AdminStats } from "@/components/admin/admin-stats"
import { SubmissionsList } from "@/components/admin/submission-lists"
import { LogOut, Search, RefreshCw } from "lucide-react"
import { toast } from "sonner"

interface AdminDashboardProps {
  adminUser: string
  onLogout: () => void
}

interface Submission {
  id: string
  ticket_number: string
  first_name: string
  last_name: string
  phone: string
  registrationNo: string
  email: string
  issue_type: string
  sub_category: string
  message: string
  submitted_at: string
  status: "In-Progress" | "Completed" | "Rejected"
}

interface Stats {
  total_count: number
  pending_count: number
  resolved_count: number
  critical_count: number
}

export function AdminDashboard({ adminUser, onLogout }: AdminDashboardProps) {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState<Stats>({
    total_count: 0,
    pending_count: 0,
    resolved_count: 0,
    critical_count: 0
  })
  const itemsPerPage = 10

  const loadData = async () => {
    setLoading(true)
    try {
      const response = await fetch(
        `/api/admin/grievances?page=${currentPage}&pageSize=${itemsPerPage}&search=${searchQuery}`
      )
      
      if (!response.ok) {
        throw new Error("Failed to fetch data")
      }

      const data = await response.json()
      setSubmissions(data.grievances)
      setStats(data.stats)
    } catch (error) {
      toast.error("Error loading data", {
        description: error instanceof Error ? error.message : "Please try again"
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [currentPage, searchQuery])

  const handleStatusUpdate = async (submissionId: string, newStatus: "In-Progress" | "Completed" | "Rejected") => {
    try {
      const response = await fetch("/api/admin/grievances", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          grievanceId: submissionId,
          status: newStatus
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update status")
      }

      // Refresh data after successful update
      loadData()
      toast.success("Status updated successfully")
    } catch (error) {
      toast.error("Error updating status", {
        description: error instanceof Error ? error.message : "Please try again"
      })
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold gradient-text mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {adminUser}</p>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={loadData} disabled={loading} className="rounded-xl">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button variant="outline" onClick={onLogout} className="rounded-xl">
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      <AdminStats stats={stats} />

      <Card className="mt-8 rounded-2xl shadow-lg border-0 bg-card/50 backdrop-blur">
        <CardHeader>
          <CardTitle className="gradient-text">All Submissions</CardTitle>
          <CardDescription>View and manage student grievance submissions</CardDescription>
          <div className="flex items-center space-x-4 pt-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, registration, issue type, or ID..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(1) // Reset to first page when searching
                }}
                className="pl-10 rounded-xl"
              />
            </div>
            <div className="text-sm text-muted-foreground">
              Showing {submissions.length} submissions
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <SubmissionsList
            submissions={submissions}
            onStatusUpdate={handleStatusUpdate}
            loading={loading}
            currentPage={currentPage}
            totalPages={Math.ceil(stats.total_count / itemsPerPage)}
            onPageChange={setCurrentPage}
          />
        </CardContent>
      </Card>
    </div>
  )
}
