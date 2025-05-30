import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface GrievanceStatsProps {
  counts: {
    inProgress: number
    resolved: number
    total: number
  }
}

export function GrievanceStats({ counts }: GrievanceStatsProps) {
  const resolvedPercentage = counts.total > 0 
    ? Math.round((counts.resolved / counts.total) * 100) 
    : 0

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Grievances</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{counts.total}</div>
          <p className="text-xs text-muted-foreground">
            Total number of grievances submitted
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">In Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{counts.inProgress}</div>
          <p className="text-xs text-muted-foreground">
            Grievances currently being processed
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Resolved</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{counts.resolved}</div>
          <Progress value={resolvedPercentage} className="mt-2" />
          <p className="text-xs text-muted-foreground mt-2">
            {resolvedPercentage}% of grievances resolved
          </p>
        </CardContent>
      </Card>
    </div>
  )
} 