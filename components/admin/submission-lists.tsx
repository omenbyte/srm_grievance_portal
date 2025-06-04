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
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "Completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "Rejected":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <FileText className="h-4 w-4 text-gray-500" />
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

  const getDaysAgo = (date: string) => {
    const submittedDate = new Date(date)
    const today = new Date()
    const diffTime = Math.abs(today.getTime() - submittedDate.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  const isCritical = (submission: Submission) => {
    return submission.status === "In-Progress" && getDaysAgo(submission.submitted_at) >= 3
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!submissions || submissions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[200px] text-center p-8">
        <FileText className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Submissions Found</h3>
        <p className="text-sm text-muted-foreground">
          There are no grievance submissions to display at this time.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {submissions.map((submission) => (
        <Card key={submission.id} className="p-4 rounded-xl border bg-background/50">
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-lg font-semibold">Ticket #{submission.ticket_number}</span>
                  <Badge variant="outline" className="ml-2">
                    {getStatusIcon(submission.status)}
                    <span className="ml-1">{submission.status}</span>
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  Submitted {getDaysAgo(submission.submitted_at)} days ago
                </div>
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

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <h4 className="font-medium">Student Details</h4>
                <div className="text-sm space-y-1">
                  <p>Name: {submission.first_name} {submission.last_name}</p>
                  <p>Registration No: {submission.registrationNo}</p>
                  <p>Email: {submission.email}</p>
                  <p>Phone: {submission.phone}</p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Issue Details</h4>
                <div className="flex items-center space-x-2 mb-2">
                  <Badge variant="secondary">{submission.issue_type}</Badge>
                  {submission.sub_category && (
                    <Badge variant="secondary">{submission.sub_category}</Badge>
                  )}
                </div>
                <p className="text-sm">{submission.message}</p>
              </div>
            </div>
          </div>
        </Card>
      ))}

      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-6">
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