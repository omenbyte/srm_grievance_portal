"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AdminStats } from "@/components/admin/admin-stats"
import { SubmissionsList } from "@/components/admin/submissions-list"
import { LogOut, Search, RefreshCw } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Database } from "@/lib/types/supabase"
import { toast } from "sonner"

interface AdminDashboardProps {
  adminUser: string
  onLogout: () => void
}

interface Submission {
  id: string
  ticket_number: string
  user: {
    first_name: string | null
    last_name: string | null
    reg_number: string
    email: string
    phone: string
  }
  issue_type: Database["public"]["Enums"]["issue_type"]
  sub_category: string
  location_details: string | null
  message: string
  image_url: string | null
  submitted_at: string
  status: Database["public"]["Enums"]["grievance_status"]
}

export function AdminDashboard({ adminUser, onLogout }: AdminDashboardProps) {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [showCriticalOnly, setShowCriticalOnly] = useState(false)
  const itemsPerPage = 10
  const supabase = createClient()

  useEffect(() => {
    loadSubmissions()
    // Set up real-time subscription
    const channel = supabase
      .channel('grievances_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'grievances'
        },
        () => {
          loadSubmissions()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const loadSubmissions = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('grievances')
        .select(`
          id,
          ticket_number,
          issue_type,
          sub_category,
          location_details,
          message,
          image_url,
          submitted_at,
          status,
          user:users (
            first_name,
            last_name,
            reg_number,
            email,
            phone
          )
        `)
        .order('submitted_at', { ascending: false })

      if (error) throw error

      setSubmissions((data || []) as unknown as Submission[])
    } catch (error) {
      console.error('Error loading submissions:', error)
      toast.error('Failed to load submissions')
    } finally {
      setLoading(false)
    }
  }

  const filteredSubmissions = useMemo(() => {
    let filtered = submissions.filter(
      (submission) => {
        const searchLower = searchQuery.toLowerCase()
        return (
          (submission.user.first_name?.toLowerCase() || '').includes(searchLower) ||
          (submission.user.last_name?.toLowerCase() || '').includes(searchLower) ||
          submission.user.reg_number.toLowerCase().includes(searchLower) ||
          submission.issue_type.toLowerCase().includes(searchLower) ||
          submission.message.toLowerCase().includes(searchLower) ||
          submission.ticket_number.toLowerCase().includes(searchLower)
        )
      }
    )

    if (showCriticalOnly) {
      filtered = filtered.filter((s) => {
        if (s.status === "resolved") return false
        const submittedDate = new Date(s.submitted_at)
        const daysDiff = (Date.now() - submittedDate.getTime()) / (1000 * 60 * 60 * 24)
        return daysDiff >= 3
      })
    }

    // Sort by submitted_at in descending order (newest first)
    return filtered.sort((a, b) => 
      new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime()
    )
  }, [submissions, searchQuery, showCriticalOnly])

  const paginatedSubmissions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredSubmissions.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredSubmissions, currentPage])

  const totalPages = Math.ceil(filteredSubmissions.length / itemsPerPage)

  const stats = useMemo(() => {
    const total = submissions.length
    const pending = submissions.filter((s) => s.status === "pending").length
    const resolved = submissions.filter((s) => s.status === "resolved").length
    const inProgress = submissions.filter((s) => s.status === "in-progress").length
    const critical = submissions.filter((s) => {
      if (s.status === "resolved") return false
      const submittedDate = new Date(s.submitted_at)
      const daysDiff = (Date.now() - submittedDate.getTime()) / (1000 * 60 * 60 * 24)
      return daysDiff >= 3
    }).length

    return { total, pending, resolved, inProgress, critical }
  }, [submissions])

  const handleStatusUpdate = async (submissionId: string, newStatus: Database["public"]["Enums"]["grievance_status"]) => {
    try {
      const { error } = await supabase
        .from('grievances')
        .update({ status: newStatus })
        .eq('id', submissionId)

      if (error) throw error

      toast.success('Status updated successfully')
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('Failed to update status')
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
          {showCriticalOnly && (
            <Button 
              variant="outline" 
              onClick={() => setShowCriticalOnly(false)} 
              className="rounded-xl"
            >
              Show All Submissions
            </Button>
          )}
          <Button variant="outline" onClick={loadSubmissions} disabled={loading} className="rounded-xl">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button variant="outline" onClick={onLogout} className="rounded-xl">
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      <AdminStats 
        stats={stats} 
        onCriticalClick={() => {
          setShowCriticalOnly(true)
          setCurrentPage(1)
        }} 
      />

      <Card className="rounded-2xl shadow-lg border-0 bg-card/80 backdrop-blur-md mt-8">
        <CardHeader>
          <CardTitle className="gradient-text">
            {showCriticalOnly ? "Critical Submissions" : "All Submissions"}
          </CardTitle>
          <CardDescription>
            {showCriticalOnly 
              ? "View and manage critical submissions (pending for 3+ days)" 
              : "View and manage student grievance submissions"}
          </CardDescription>
          <div className="flex items-center space-x-4 pt-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, registration, ticket number, issue type, or message..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(1)
                }}
                className="pl-10 rounded-xl"
              />
            </div>
            <div className="text-sm text-muted-foreground">
              Showing {paginatedSubmissions.length} of {filteredSubmissions.length} submissions
              {totalPages > 1 && ` (Page ${currentPage} of ${totalPages})`}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <SubmissionsList
            submissions={paginatedSubmissions}
            onStatusUpdate={handleStatusUpdate}
            loading={loading}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </CardContent>
      </Card>
    </div>
  )
}
