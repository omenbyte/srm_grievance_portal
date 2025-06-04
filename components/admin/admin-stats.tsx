import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Clock, CheckCircle, AlertTriangle } from "lucide-react"

interface AdminStatsProps {
  stats: {
    total: number
    pending: number
    resolved: number
    critical: number
  }
}

export function AdminStats({ stats }: AdminStatsProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <Card className="rounded-2xl shadow-lg border-0 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <span>Total Submissions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.total}</div>
          <p className="text-xs text-muted-foreground mt-1">All time submissions</p>
        </CardContent>
      </Card>

      <Card className="rounded-2xl shadow-lg border-0 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            <span>Pending</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pending}</div>
          <p className="text-xs text-muted-foreground mt-1">Awaiting review</p>
        </CardContent>
      </Card>

      <Card className="rounded-2xl shadow-lg border-0 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            <span>Resolved</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.resolved}</div>
          <p className="text-xs text-muted-foreground mt-1">Successfully resolved</p>
        </CardContent>
      </Card>

      <Card className="rounded-2xl shadow-lg border-0 bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-950/20 dark:to-pink-950/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
            <span>Critical</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-red-600 dark:text-red-400">{stats.critical}</div>
          <p className="text-xs text-muted-foreground mt-1">Pending 3+ days</p>
        </CardContent>
      </Card>
    </div>
  )
}
