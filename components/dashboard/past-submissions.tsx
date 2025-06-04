import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, CheckCircle, AlertCircle, FileText, ChevronDown, ChevronUp } from "lucide-react"
import { useState } from "react"

interface Submission {
  id: string
  firstName: string
  lastName: string
  issueType: string
  message: string
  submittedAt: string
  status: "pending" | "in-progress" | "resolved"
}

interface PastSubmissionsProps {
  submissions: Submission[]
}

export function PastSubmissions({ submissions }: PastSubmissionsProps) {
  const [expandedSubmissions, setExpandedSubmissions] = useState<Set<string>>(new Set())

  const toggleSubmission = (id: string) => {
    setExpandedSubmissions(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

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

  return (
    <Card className="rounded-2xl shadow-lg border-0 bg-card/80 backdrop-blur">
      <CardHeader>
        <CardTitle className="gradient-text">Past Submissions</CardTitle>
        <CardDescription>Track the status of your previous grievances</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {submissions.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No submissions yet. Submit your first grievance to get started.
            </p>
          ) : (
            submissions
              .slice()
              .reverse()
              .map((submission) => (
                <div
                  key={submission.id}
                  className="p-4 rounded-xl border bg-background/50 hover:bg-background/80 transition-colors"
                >
                  <div 
                    className="flex items-start justify-between mb-2 cursor-pointer"
                    onClick={() => toggleSubmission(submission.id)}
                  >
                    <div className="flex items-center space-x-2">
                      <h4 className="font-semibold">
                        {submission.firstName} {submission.lastName}
                      </h4>
                      <Badge variant="secondary" className="capitalize">
                        {submission.issueType}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(submission.status)}>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(submission.status)}
                          <span className="capitalize">{submission.status}</span>
                        </div>
                      </Badge>
                      {expandedSubmissions.has(submission.id) ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                  {expandedSubmissions.has(submission.id) && (
                    <>
                      <p className="text-sm text-muted-foreground mb-2">{submission.message}</p>
                      <div className="flex justify-between items-center text-xs text-muted-foreground">
                        <span>ID: {submission.id}</span>
                        <span>Submitted: {new Date(submission.submittedAt).toLocaleDateString()}</span>
                      </div>
                    </>
                  )}
                </div>
              ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
