"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Clock, CheckCircle, Loader2, AlertTriangle } from "lucide-react"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"

interface GrievanceStatsProps {
  stats: {
    total: number
    pending: number
    resolved: number
    inProgress: number
    critical: number
  }
}

export function GrievanceStats({ stats }: GrievanceStatsProps) {
  const [showCriticalDialog, setShowCriticalDialog] = useState(false)

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5 mb-8">
        <Card className="rounded-2xl shadow-lg border-0 bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <span>Total Submissions</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {stats.total}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-lg border-0 bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              <span>Pending</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
              {stats.pending}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-lg border-0 bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2">
              <Loader2 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              <span>In Progress</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
              {stats.inProgress}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-lg border-0 bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              <span>Resolved</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
              {stats.resolved}
            </div>
          </CardContent>
        </Card>

        <Card 
          className="rounded-2xl shadow-lg border-0 bg-card cursor-pointer hover:bg-card/80 transition-colors"
          onClick={() => setShowCriticalDialog(true)}
        >
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
              <span>Critical</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600 dark:text-red-400">
              {stats.critical}
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={showCriticalDialog} onOpenChange={setShowCriticalDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Critical Grievances</DialogTitle>
            <DialogDescription>
              The following grievances have been pending for more than 3 days. Please fill out the contact form with your ticket number for immediate assistance.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              For urgent assistance, please contact our support team with your ticket number. We apologize for the delay and are working to resolve your issue as soon as possible.
            </p>
            <div className="flex justify-end">
              <button
                onClick={() => setShowCriticalDialog(false)}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Close
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
} 