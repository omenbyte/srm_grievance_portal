"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"
import { ArrowLeft, ArrowRight } from "lucide-react"

interface Submission {
  id: string
  ticket_number: string
  firstName: string
  lastName: string
  issueType: string
  message: string
  submittedAt: string
  status: "pending" | "in-progress" | "resolved"
}

interface GrievanceFormProps {
  userPhone: string
  onSuccess: (submission: Submission) => void
  onCancel: () => void
}

interface FormData {
  firstName: string
  lastName: string
  email: string
  registrationNo: string
  mobile: string
  issueType: string
  subCategory: string
  locationDetails: string
  message: string
  imageUrl: string | null
}

const initialFormData: FormData = {
  firstName: "",
  lastName: "",
  email: "",
  registrationNo: "",
  mobile: "",
  issueType: "",
  subCategory: "",
  locationDetails: "",
  message: "",
  imageUrl: null
}

const subCategories = {
  Classroom: [
    { value: "Infrastructure", label: "Infrastructure" },
    { value: "Equipment", label: "Equipment" },
    { value: "Maintenance", label: "Maintenance" },
    { value: "Capacity", label: "Capacity" }
  ],
  Administration: [
    { value: "Admission", label: "Admission" },
    { value: "Documentation", label: "Documentation" },
    { value: "Staff", label: "Staff" },
    { value: "Policies", label: "Policies" }
  ],
  Academic: [
    { value: "Curriculum", label: "Curriculum" },
    { value: "Examinations", label: "Examinations" },
    { value: "Faculty", label: "Faculty" },
    { value: "Assignments", label: "Assignments" }
  ],
  Accounts: [
    { value: "Fees", label: "Fees" },
    { value: "Scholarship", label: "Scholarship" },
    { value: "Refunds", label: "Refunds" },
    { value: "Billing", label: "Billing" }
  ],
  Transport: [
    { value: "Bus Routes", label: "Bus Routes" },
    { value: "Bus Condition", label: "Bus Condition" },
    { value: "Driver", label: "Driver" },
    { value: "Safety", label: "Safety" }
  ],
  Hostel: [
    { value: "Accommodation", label: "Accommodation" },
    { value: "Maintenance", label: "Maintenance" },
    { value: "Food", label: "Food" },
    { value: "Security", label: "Security" }
  ],
  Laboratory: [
    { value: "Equipment", label: "Equipment" },
    { value: "Safety", label: "Safety" },
    { value: "Access", label: "Access" },
    { value: "Resources", label: "Resources" }
  ]
}

const locationFields = {
  Classroom: { label: "Classroom Number", placeholder: "Enter classroom number" },
  Transport: { label: "Bus Route", placeholder: "Enter bus route number" },
  Hostel: { label: "Hostel Block & Room", placeholder: "Enter hostel block and room number" },
  Laboratory: { label: "Laboratory Name", placeholder: "Enter laboratory name" }
}

export function GrievanceForm({ userPhone, onSuccess, onCancel }: GrievanceFormProps) {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<FormData>({
    ...initialFormData,
    mobile: userPhone
  })
  const [loading, setLoading] = useState(false)
  const [canSubmit, setCanSubmit] = useState(true)
  const [cooldownMessage, setCooldownMessage] = useState<string | null>(null)

  const totalSteps = 3
  const progress = (step / totalSteps) * 100

  const checkSubmissionStatus = useCallback(async () => {
    try {
      const userResponse = await fetch(`/api/get-user-id?phone=${userPhone}`)
      const userData = await userResponse.json()

      if (!userResponse.ok) {
        throw new Error(userData.message || 'Failed to get user ID')
      }

      const response = await fetch(`/api/submit-grievance?userId=${userData.userId}`)
      const data = await response.json()

      if (response.ok) {
        setCanSubmit(data.canSubmit)
        setCooldownMessage(data.cooldownMessage)
      }
    } catch (error) {
      console.error('Error checking submission status:', error)
    }
  }, [userPhone])

  useEffect(() => {
    checkSubmissionStatus()
  }, [checkSubmissionStatus])

  const validateStep = (currentStep: number): boolean => {
    switch (currentStep) {
      case 1:
        return (
          formData.firstName.length >= 3 &&
          formData.firstName.length <= 20 &&
          formData.lastName.length >= 3 &&
          formData.lastName.length <= 20 &&
          /^[6-9]\d{9}$/.test(formData.mobile) &&
          formData.registrationNo.length >= 12 &&
          formData.registrationNo.length <= 15 &&
          formData.email.endsWith("@srmist.edu.in") &&
          formData.email.length <= 20
        )
      case 2:
        return (
          formData.issueType !== "" &&
          formData.subCategory !== "" &&
          formData.message.length > 0 &&
          (!locationFields[formData.issueType as keyof typeof locationFields] || formData.locationDetails.length > 0)
        )
      default:
        return true
    }
  }

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1)
    } else {
      toast.error("Validation Error", {    
        description: "Please fill all required fields correctly",
      })
    }
  }

  const handleSubmit = async () => {
    if (!validateStep(2)) {
      toast.error("Validation Error", {
        description: "Please check all fields",
      })
      return
    }

    if (!canSubmit) {
      toast.error("Cannot Submit", {
        description: cooldownMessage || "You can only submit one grievance every 24 hours"
      })
      return
    }

    setLoading(true)

    try {
      const userResponse = await fetch(`/api/get-user-id?phone=${userPhone}`)
      const userData = await userResponse.json()

      if (!userResponse.ok) {
        throw new Error(userData.message || 'Failed to get user ID')
      }

      let imageUrl = null

      if (formData.imageUrl) {
        const response = await fetch('/api/upload-image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            file: formData.imageUrl,
            userId: userData.userId
          }),
        })

        if (!response.ok) {
          throw new Error('Failed to upload image')
        }

        const data = await response.json()
        imageUrl = data.url
      }

      const response = await fetch('/api/submit-grievance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userData.userId,
          issueType: formData.issueType,
          subCategory: formData.subCategory,
          locationDetails: formData.locationDetails,
          message: formData.message,
          imageUrl,
          userDetails: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            registrationNo: formData.registrationNo,
            mobile: formData.mobile,
          },
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit grievance')
      }

      const submission: Submission = {
        id: data.grievance.id,
        ticket_number: data.grievance.ticket_number,
        firstName: formData.firstName,
        lastName: formData.lastName,
        issueType: formData.issueType,
        message: formData.message,
        submittedAt: data.grievance.submitted_at,
        status: data.grievance.status,
      }

      setCanSubmit(false)
      setCooldownMessage('You can submit another grievance in 24 hours')
      toast.success("Grievance Submitted Successfully!", {
        description: "Your grievance has been submitted and will be reviewed soon.",
      })
      onSuccess(submission)
    } catch (error) {
      toast.error("Error", {
        description: error instanceof Error ? error.message : 'Failed to submit grievance',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File too large", {
          description: "Please select an image under 5MB"
        })
        return
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        toast.error("Invalid file type", {
          description: "Please select an image file"
        })
        return
      }

      // Convert to base64
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          setFormData(prev => ({
            ...prev,
            imageUrl: event.target?.result as string
          }))
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const renderStep1 = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Personal Information</h3>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name *</Label>
          <Input
            id="firstName"
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            className="rounded-xl"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name *</Label>
          <Input
            id="lastName"
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            className="rounded-xl"
            required
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="mobile">Mobile Number *</Label>
        <Input
          id="mobile"
          type="tel"
          value={formData.mobile}
          onChange={(e) => setFormData({ ...formData, mobile: e.target.value.replace(/\D/g, "").slice(0, 10) })}
          className="rounded-xl"
          readOnly
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="registrationNo">Registration Number *</Label>
        <Input
          id="registrationNo"
          placeholder="12-15 characters"
          value={formData.registrationNo}
          onChange={(e) => setFormData({ ...formData, registrationNo: e.target.value })}
          className="rounded-xl"
          maxLength={15}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email Address *</Label>
        <Input
          id="email"
          type="email"
          placeholder="Enter your SRM email (@srmist.edu.in)"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="rounded-xl"
          required
        />
        <p className="text-xs text-muted-foreground">
          Use your official SRM email (@srmist.edu.in)
        </p>
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Grievance Details</h3>
      <div className="space-y-2">
        <Label htmlFor="issueType">Category *</Label>
        <Select
          value={formData.issueType}
          onValueChange={(value) => {
            setFormData({ ...formData, issueType: value, subCategory: "" })
          }}
        >
          <SelectTrigger className="rounded-xl">
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {Object.keys(subCategories).map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {formData.issueType && (
        <div className="space-y-2">
          <Label htmlFor="subCategory">Sub-Category *</Label>
          <Select
            value={formData.subCategory}
            onValueChange={(value) => setFormData({ ...formData, subCategory: value })}
          >
            <SelectTrigger className="rounded-xl">
              <SelectValue placeholder="Select a sub-category" />
            </SelectTrigger>
            <SelectContent>
              {subCategories[formData.issueType as keyof typeof subCategories].map((sub) => (
                <SelectItem key={sub.value} value={sub.value}>
                  {sub.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {formData.issueType && locationFields[formData.issueType as keyof typeof locationFields] && (
        <div className="space-y-2">
          <Label htmlFor="locationDetails">
            {locationFields[formData.issueType as keyof typeof locationFields].label} *
          </Label>
          <Input
            id="locationDetails"
            placeholder={locationFields[formData.issueType as keyof typeof locationFields].placeholder}
            value={formData.locationDetails}
            onChange={(e) => setFormData({ ...formData, locationDetails: e.target.value })}
            className="rounded-xl"
            required
          />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="message">Description *</Label>
        <Textarea
          id="message"
          placeholder="Describe your grievance in detail"
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          className="rounded-xl min-h-[100px]"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="image">Upload Image (Optional)</Label>
        <Input
          id="image"
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="rounded-xl"
        />
        {formData.imageUrl && (
          <div className="mt-2">
            <img 
              src={formData.imageUrl} 
              alt="Uploaded" 
              className="max-w-xs rounded-lg"
            />
          </div>
        )}
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Review Your Grievance</h3>
      
      <div className="space-y-4">
        <div>
          <h4 className="font-medium mb-2">Personal Information</h4>
          <div className="space-y-1 text-sm">
            <p><span className="text-muted-foreground">Name:</span> {formData.firstName} {formData.lastName}</p>
            <p><span className="text-muted-foreground">Mobile:</span> {formData.mobile}</p>
            <p><span className="text-muted-foreground">Registration No:</span> {formData.registrationNo}</p>
            <p><span className="text-muted-foreground">Email:</span> {formData.email}</p>
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-2">Grievance Details</h4>
          <div className="space-y-1 text-sm">
            <p><span className="text-muted-foreground">Category:</span> {formData.issueType}</p>
            <p><span className="text-muted-foreground">Sub-Category:</span> {formData.subCategory}</p>
            {formData.locationDetails && (
              <p><span className="text-muted-foreground">Location:</span> {formData.locationDetails}</p>
            )}
            <div className="mt-2">
              <p className="text-muted-foreground mb-1">Description:</p>
              <p className="text-sm bg-muted/50 p-3 rounded-lg">{formData.message}</p>
            </div>
            {formData.imageUrl && (
              <div className="mt-2">
                <p className="text-muted-foreground mb-1">Attached Image:</p>
                <img 
                  src={formData.imageUrl} 
                  alt="Uploaded" 
                  className="max-w-xs rounded-lg"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-2xl rounded-2xl border-0 bg-card/90 backdrop-blur-md">
      <CardHeader>
        <CardTitle className="text-2xl font-bold gradient-text">Submit Grievance</CardTitle>
        <CardDescription>
          {step === 1
            ? "Enter your personal information"
            : step === 2
            ? "Describe your grievance"
            : "Review your submission"}
        </CardDescription>
        <Progress value={progress} className="mt-4" />
      </CardHeader>
      <CardContent>
        <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}

          <div className="flex justify-between pt-4">
            {step > 1 ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(step - 1)}
                className="rounded-xl"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>
            ) : (
              <div />
            )}
            {step < totalSteps ? (
              <Button
                type="button"
                onClick={handleNext}
                disabled={!validateStep(step)}
                className="rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="submit"
                onClick={handleSubmit}
                disabled={loading || !validateStep(2)}
                className="rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {loading ? "Submitting..." : "Submit Grievance"}
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
