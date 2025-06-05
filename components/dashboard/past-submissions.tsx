import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, CheckCircle, AlertCircle, FileText } from "lucide-react"

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

interface PastSubmissionsProps {
  submissions: Submission[]
}

export function PastSubmissions({ submissions }: PastSubmissionsProps) {
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

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold gradient-text mb-4">Your Submissions</h2>
      {submissions.map((submission) => (
        <Card key={submission.id} className="p-4 rounded-xl border bg-card/50 backdrop-blur">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="font-semibold text-lg">
                {submission.issueType}
              </h3>
              {submission.sub_category && (
                <div className="text-sm text-muted-foreground">
                  {submission.sub_category}
                </div>
              )}
            </div>
            <Badge className={getStatusColor(submission.status)}>
              <div className="flex items-center space-x-1">
                {getStatusIcon(submission.status)}
                <span className="capitalize">{submission.status}</span>
              </div>
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3 text-sm">
            <div>
              <span className="text-muted-foreground">Category:</span> {submission.sub_category || "N/A"}
            </div>
            <div>
              <span className="text-muted-foreground">Days ago:</span> {getDaysAgo(submission.submittedAt)}
            </div>
          </div>

          {submission.location_details && (
            <div className="text-sm mb-2">
              <span className="text-muted-foreground">Location:</span> {submission.location_details}
            </div>
          )}

          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{submission.message}</p>

          <div className="flex justify-between items-center text-xs text-muted-foreground">
            <span>Ticket: {submission.ticket_number}</span>
            <span>Submitted: {new Date(submission.submittedAt).toLocaleDateString()}</span>
          </div>
        </Card>
      ))}
    </div>
  )
}
