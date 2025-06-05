"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Clock, CheckCircle, AlertCircle, FileText, ChevronLeft, ChevronRight, AlertTriangle } from "lucide-react"
import { Database } from "@/lib/types/supabase"

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

interface SubmissionsListProps {
  submissions: Submission[]
  onStatusUpdate: (submissionId: string, newStatus: Database["public"]["Enums"]["grievance_status"]) => void
  loading: boolean
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function SubmissionsList({
  submissions,
  onStatusUpdate,
  loading,
  currentPage,
  totalPages,
  onPageChange,
}: SubmissionsListProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />
      case "in-progress":
        return <AlertCircle className="h-4 w-4" />
      case "resolved":
        return <CheckCircle className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
      case "in-progress":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
      case "resolved":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
    }
  }

  const getDaysAgo = (dateString: string) => {
    const submittedDate = new Date(dateString)
    const daysDiff = Math.floor((Date.now() - submittedDate.getTime()) / (1000 * 60 * 60 * 24))
    return daysDiff
  }

  const isCritical = (submission: Submission) => {
    return submission.status !== "resolved" && getDaysAgo(submission.submitted_at) >= 3
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="p-4 rounded-xl border bg-background/50 animate-pulse">
            <div className="h-4 bg-muted rounded w-1/3 mb-2"></div>
            <div className="h-3 bg-muted rounded w-2/3 mb-2"></div>
            <div className="h-3 bg-muted rounded w-1/2"></div>
          </div>
        ))}
      </div>
    )
  }

  if (submissions.length === 0) {
    return (
      <div className="text-center py-8">
        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">No submissions found matching your search criteria.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {submissions.map((submission) => (
        <Card
          key={submission.id}
          className={`p-4 rounded-xl border transition-colors hover:bg-background/80 ${
            isCritical(submission)
              ? "border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-950/10"
              : "bg-background/50"
          }`}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-3">
              <h4 className="font-semibold">
                {submission.user.first_name || ''} {submission.user.last_name || ''}
              </h4>
              <Badge variant="secondary" className="capitalize">
                {submission.issue_type}
              </Badge>
              {isCritical(submission) && (
                <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Critical
                </Badge>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Select
                value={submission.status}
                onValueChange={(value: Database["public"]["Enums"]["grievance_status"]) => onStatusUpdate(submission.id, value)}
              >
                <SelectTrigger className="w-32 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
              <Badge className={getStatusColor(submission.status)}>
                <div className="flex items-center space-x-1">
                  {getStatusIcon(submission.status)}
                  <span className="capitalize">{submission.status}</span>
                </div>
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3 text-sm">
            <div>
              <span className="text-muted-foreground">Registration:</span> {submission.user.reg_number}
            </div>
            <div>
              <span className="text-muted-foreground">Mobile:</span> {submission.user.phone}
            </div>
            <div>
              <span className="text-muted-foreground">Email:</span> {submission.user.email}
            </div>
            <div>
              <span className="text-muted-foreground">Days ago:</span> {getDaysAgo(submission.submitted_at)}
            </div>
          </div>

          {/* Location details if available */}
          {submission.location_details && (
            <div className="text-sm mb-2">
              <span className="text-muted-foreground">Location:</span> {submission.location_details}
            </div>
          )}

          {/* Sub-category */}
          <div className="text-sm mb-2">
            <span className="text-muted-foreground">Category:</span> {submission.sub_category}
          </div>

          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{submission.message}</p>

          <div className="flex justify-between items-center text-xs text-muted-foreground">
            <span>Ticket: {submission.ticket_number}</span>
            <span>Submitted: {new Date(submission.submitted_at).toLocaleDateString()}</span>
          </div>
        </Card>
      ))}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <div className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="rounded-xl"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="rounded-xl"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
