"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Clock, CheckCircle, AlertCircle, FileText, ChevronLeft, ChevronRight, AlertTriangle } from "lucide-react"

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

interface SubmissionsListProps {
  submissions: Submission[]
  onStatusUpdate: (submissionId: string, newStatus: "In-Progress" | "Completed" | "Rejected") => void
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
      case "In-Progress":
        return <Clock className="h-4 w-4" />
      case "Completed":
        return <CheckCircle className="h-4 w-4" />
      case "Rejected":
        return <AlertCircle className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "In-Progress":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
      case "Completed":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
      case "Rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
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
    return submission.status === "In-Progress" && getDaysAgo(submission.submitted_at) >= 3
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
        <Card key={submission.id} className="p-4 rounded-xl border bg-background/50">
          <div className="flex flex-col space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">
                  {submission.first_name} {submission.last_name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {submission.registrationNo} • {submission.email}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className={getStatusColor(submission.status)}>
                  {getStatusIcon(submission.status)}
                  <span className="ml-1">{submission.status}</span>
                </Badge>
                {isCritical(submission) && (
                  <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="ml-1">Critical</span>
                  </Badge>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Badge variant="secondary">{submission.issue_type}</Badge>
                {submission.sub_category && (
                  <Badge variant="secondary">{submission.sub_category}</Badge>
                )}
              </div>
              <p className="text-sm">{submission.message}</p>
            </div>

            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                Ticket #{submission.ticket_number} • {getDaysAgo(submission.submitted_at)} days ago
              </div>
              <Select
                value={submission.status}
                onValueChange={(value) => onStatusUpdate(submission.id, value as "In-Progress" | "Completed" | "Rejected")}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Update Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="In-Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>
      ))}

      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
