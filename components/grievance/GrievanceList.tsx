"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { StatusUpdateButtons } from "./StatusUpdateButtons"

interface Grievance {
  id: string
  firstName: string
  lastName: string
  issueType: string
  subCategory: string
  message: string
  status: string
  submitted_at: string
  priority: string
}

interface GrievanceListProps {
  grievances: Grievance[]
  isAdmin?: boolean
}

export function GrievanceList({ grievances: initialGrievances, isAdmin = false }: GrievanceListProps) {
  const [grievances, setGrievances] = useState(initialGrievances)

  const handleStatusUpdate = (grievanceId: string, newStatus: string) => {
    setGrievances(prev =>
      prev.map(grievance =>
        grievance.id === grievanceId
          ? { ...grievance, status: newStatus }
          : grievance
      )
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500'
      case 'in-progress':
        return 'bg-blue-500'
      case 'resolved':
        return 'bg-green-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical':
        return 'bg-red-500'
      case 'High':
        return 'bg-orange-500'
      case 'Medium':
        return 'bg-yellow-500'
      case 'Low':
        return 'bg-green-500'
      default:
        return 'bg-gray-500'
    }
  }

  return (
    <div className="space-y-4">
      {grievances.map((grievance) => (
        <Card key={grievance.id} className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">
                  {grievance.firstName} {grievance.lastName}
                </CardTitle>
                <div className="flex gap-2 mt-2">
                  <Badge className={getStatusColor(grievance.status)}>
                    {grievance.status}
                  </Badge>
                  <Badge className={getPriorityColor(grievance.priority)}>
                    {grievance.priority}
                  </Badge>
                </div>
              </div>
              {isAdmin && (
                <StatusUpdateButtons
                  grievanceId={grievance.id}
                  currentStatus={grievance.status}
                  onStatusUpdate={(newStatus) => handleStatusUpdate(grievance.id, newStatus)}
                />
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex gap-2 text-sm text-muted-foreground">
                <span>Category: {grievance.issueType}</span>
                <span>•</span>
                <span>Sub-Category: {grievance.subCategory}</span>
              </div>
              <p className="text-sm">{grievance.message}</p>
              <p className="text-xs text-muted-foreground">
                Submitted: {new Date(grievance.submitted_at).toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
} 