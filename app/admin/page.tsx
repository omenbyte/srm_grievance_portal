'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

interface Grievance {
  id: string
  ticket_number: string
  issue_type: string
  sub_category: string
  message: string
  status: 'pending' | 'in-progress' | 'completed'
  submitted_at: string
  user: {
    first_name: string
    last_name: string
    reg_number: string
    email: string
    phone: string
  }
}

interface AdminDashboardProps {
  adminUser: string
  onLogout: () => void
}

export default function AdminDashboard({ adminUser, onLogout }: AdminDashboardProps) {
  const [grievances, setGrievances] = useState<Grievance[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  const fetchGrievances = async () => {
    try {
      const { data, error } = await supabase
        .from('grievances')
        .select(`
          *,
          user:users (
            first_name,
            last_name,
            reg_number,
            email,
            phone
          )
        `)
        .order('submitted_at', { ascending: false })

      if (error) throw error
      setGrievances(data || [])
    } catch (error) {
      console.error('Error fetching grievances:', error)
      toast.error('Failed to fetch grievances')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGrievances()
  }, [])

  const handleStatusUpdate = async (id: string, newStatus: 'pending' | 'in-progress' | 'completed') => {
    try {
      const { error } = await supabase
        .from('grievances')
        .update({ status: newStatus })
        .eq('id', id)

      if (error) throw error

      toast.success('Status updated successfully')
      fetchGrievances() // Refresh the list
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('Failed to update status')
    }
  }

  const filteredGrievances = grievances.filter(grievance => {
    const searchLower = searchQuery.toLowerCase()
    return (
      grievance.ticket_number.toLowerCase().includes(searchLower) ||
      grievance.issue_type.toLowerCase().includes(searchLower) ||
      grievance.sub_category.toLowerCase().includes(searchLower) ||
      grievance.user.first_name.toLowerCase().includes(searchLower) ||
      grievance.user.last_name.toLowerCase().includes(searchLower) ||
      grievance.user.reg_number.toLowerCase().includes(searchLower) ||
      grievance.user.email.toLowerCase().includes(searchLower) ||
      grievance.user.phone.toLowerCase().includes(searchLower)
    )
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500'
      case 'in-progress':
        return 'bg-blue-500'
      case 'completed':
        return 'bg-green-500'
      default:
        return 'bg-gray-500'
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>
  }

  return (
    <div className="container mx-auto p-4 space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-sm text-gray-500">Welcome, {adminUser}</p>
        </div>
        <div className="flex gap-4 items-center">
          <Input
            type="search"
            placeholder="Search grievances..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
          <Button onClick={onLogout} variant="outline">Logout</Button>
        </div>
      </div>

      <div className="grid gap-4">
        {filteredGrievances.map((grievance) => (
          <Card key={grievance.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">
                    Ticket #{grievance.ticket_number}
                  </CardTitle>
                  <p className="text-sm text-gray-500">
                    Submitted: {new Date(grievance.submitted_at).toLocaleString()}
                  </p>
                </div>
                <Badge className={getStatusColor(grievance.status)}>
                  {grievance.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <strong>Student Details:</strong>
                  <p>Name: {grievance.user.first_name} {grievance.user.last_name}</p>
                  <p>Registration No: {grievance.user.reg_number}</p>
                  <p>Email: {grievance.user.email}</p>
                  <p>Phone: {grievance.user.phone}</p>
                </div>
                <div>
                  <strong>Issue Details:</strong>
                  <p>Type: {grievance.issue_type}</p>
                  <p>Sub-Category: {grievance.sub_category}</p>
                  <p>Message: {grievance.message}</p>
                </div>
                <div className="flex gap-2 mt-4">
                  {grievance.status !== 'in-progress' && (
                    <Button
                      onClick={() => handleStatusUpdate(grievance.id, 'in-progress')}
                      variant="outline"
                    >
                      Mark In Progress
                    </Button>
                  )}
                  {grievance.status !== 'completed' && (
                    <Button
                      onClick={() => handleStatusUpdate(grievance.id, 'completed')}
                      variant="outline"
                    >
                      Mark Completed
                    </Button>
                  )}
                  {grievance.status !== 'pending' && (
                    <Button
                      onClick={() => handleStatusUpdate(grievance.id, 'pending')}
                      variant="outline"
                    >
                      Mark Pending
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
} 