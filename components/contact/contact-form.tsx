"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

export function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    registrationNo: "",
    email: "",
    contactNo: "",
    message: ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('https://formsubmit.co/itinfra@srmimt.net', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          registrationNo: formData.registrationNo,
          email: formData.email,
          contactNo: formData.contactNo,
          message: formData.message,
          _subject: 'Grievance Portal - Technical Support',
          _template: 'table'
        })
      })

      if (!response.ok) {
        throw new Error('Failed to submit message')
      }

      toast.success('Message sent successfully!')
      setFormData({
        name: "",
        registrationNo: "",
        email: "",
        contactNo: "",
        message: ""
      })
    } catch (error) {
      toast.error('Failed to send message. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Input
          type="text"
          name="name"
          placeholder="Full Name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <Input
          type="text"
          name="registrationNo"
          placeholder="Registration Number"
          value={formData.registrationNo}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <Input
          type="email"
          name="email"
          placeholder="SRM Email (@srmist.edu.in)"
          value={formData.email}
          onChange={handleChange}
          pattern="[a-zA-Z0-9._%+-]+@srmist\.edu\.in$"
          required
        />
      </div>
      <div>
        <Input
          type="tel"
          name="contactNo"
          placeholder="Contact Number (10 digits)"
          value={formData.contactNo}
          onChange={handleChange}
          pattern="[0-9]{10}"
          required
        />
      </div>
      <div>
        <Textarea
          name="message"
          placeholder="Your Message (max 355 characters)"
          value={formData.message}
          onChange={handleChange}
          maxLength={355}
          required
          className="min-h-[100px]"
        />
      </div>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Sending...' : 'Send Message'}
      </Button>
    </form>
  )
}
