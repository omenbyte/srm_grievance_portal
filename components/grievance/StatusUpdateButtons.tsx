"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface StatusUpdateButtonsProps {
  grievanceId: string
  currentStatus: string
  onStatusUpdate: (newStatus: string) => void
}

export function StatusUpdateButtons({ grievanceId, currentStatus, onStatusUpdate }: StatusUpdateButtonsProps) {
  const [loading, setLoading] = useState(false)

  const updateStatus = async (newStatus: string) => {
    setLoading(true)
    try {
      const response = await fetch('/api/grievance/update-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          grievanceId,
          newStatus,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update status')
      }

      onStatusUpdate(newStatus)
      toast.success(`Status updated to ${newStatus}`)
    } catch (error) {
      toast.error('Failed to update status')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex gap-2">
      {currentStatus === 'pending' && (
        <Button
          onClick={() => updateStatus('in-progress')}
          disabled={loading}
          className="bg-yellow-600 hover:bg-yellow-700"
        >
          {loading ? 'Updating...' : 'Mark as In Progress'}
        </Button>
      )}
      {currentStatus === 'in-progress' && (
        <Button
          onClick={() => updateStatus('resolved')}
          disabled={loading}
          className="bg-green-600 hover:bg-green-700"
        >
          {loading ? 'Updating...' : 'Mark as Resolved'}
        </Button>
      )}
    </div>
  )
} 