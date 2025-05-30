"use client"

import type React from "react"
import Image from "next/image"
import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Upload, X, CheckCircle } from "lucide-react"

interface Submission {
  id: string
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

const issueTypes = [
  { value: "Classroom", label: "Classroom" },
  { value: "Hostel", label: "Hostel" },
  { value: "Academic", label: "Academic" },
  { value: "Bus", label: "Bus" },
  { value: "Facilities", label: "Facilities" },
  { value: "Others", label: "Others" },
]

export function GrievanceForm({ userPhone, onSuccess, onCancel }: GrievanceFormProps) {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    mobile: userPhone,
    registrationNo: "",
    email: "",
    issueType: "",
    message: "",
    image: null as string | null,
    roomNo: "",
    subject: "",
    busRoute: "",
    facilityType: "",
  })
  const [loading, setLoading] = useState(false)
  const [canSubmit, setCanSubmit] = useState(true)
  const [cooldownMessage, setCooldownMessage] = useState<string | null>(null)

  const totalSteps = 4
  const progress = (step / totalSteps) * 100

  const checkSubmissionStatus = useCallback(async () => {
    try {
      // First get the user ID from the phone number
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
          formData.registrationNo.length <= 15
        )
      case 2:
        if (formData.email.endsWith("@srmist.edu.in")) {
          return true
        }
        return formData.email.length <= 6
      case 3:
        return formData.issueType !== ""
      case 4:
        return formData.message.length > 0 && formData.message.length <= 355
      default:
        return true
    }
  }

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1)
    } else {
      toast.error("Validation Error",{    
        description: "Please fill all required fields correctly",
      })
    }
  }

  const handleSubmit = async () => {
    if (!validateStep(4)) {
      toast.error("Validation Error",{
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
      // First get the user ID from the phone number
      const userResponse = await fetch(`/api/get-user-id?phone=${userPhone}`)
      const userData = await userResponse.json()

      if (!userResponse.ok) {
        throw new Error(userData.message || 'Failed to get user ID')
      }

      let imageUrl = null

      // Upload image if present
      if (formData.image) {
        const response = await fetch('/api/upload-image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            file: formData.image,
            userId: userData.userId
          }),
        })

        if (!response.ok) {
          throw new Error('Failed to upload image')
        }

        const data = await response.json()
        imageUrl = data.url
      }

      // Get the sub-category based on issue type
      let subCategory = 'General'
      switch (formData.issueType) {
        case 'Hostel':
          subCategory = formData.roomNo || 'Room Number Not Specified'
          break
        case 'Academic':
          subCategory = formData.subject || 'Subject Not Specified'
          break
        case 'Bus':
          subCategory = formData.busRoute || 'Route Not Specified'
          break
        case 'Facilities':
          subCategory = formData.facilityType || 'Facility Type Not Specified'
          break
        case 'Classroom':
          subCategory = 'Classroom Issue'
          break
        case 'Others':
          subCategory = 'Other Issue'
          break
      }

      // Submit grievance
      const response = await fetch('/api/submit-grievance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userData.userId,
          issueType: formData.issueType,
          subCategory,
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
            image: event.target?.result as string
          }))
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const renderConditionalFields = () => {
    switch (formData.issueType) {
      case "Hostel":
        return (
          <div className="space-y-2">
            <Label htmlFor="roomNo">Room Number</Label>
            <Input
              id="roomNo"
              placeholder="Enter room number"
              value={formData.roomNo || ""}
              onChange={(e) => setFormData({ ...formData, roomNo: e.target.value })}
              className="rounded-xl"
            />
          </div>
        )
      case "Academic":
        return (
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              placeholder="Enter subject name"
              value={formData.subject || ""}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="rounded-xl"
            />
          </div>
        )
      case "Bus":
        return (
          <div className="space-y-2">
            <Label htmlFor="busRoute">Bus Route</Label>
            <Input
              id="busRoute"
              placeholder="Enter bus route"
              value={formData.busRoute || ""}
              onChange={(e) => setFormData({ ...formData, busRoute: e.target.value })}
              className="rounded-xl"
            />
          </div>
        )
      case "Facilities":
        return (
          <div className="space-y-2">
            <Label htmlFor="facilityType">Facility Type</Label>
            <Select
              value={formData.facilityType || ""}
              onValueChange={(value) => setFormData({ ...formData, facilityType: value })}
            >
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Select facility type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="library">Library</SelectItem>
                <SelectItem value="cafeteria">Cafeteria</SelectItem>
                <SelectItem value="sports">Sports Complex</SelectItem>
                <SelectItem value="medical">Medical Center</SelectItem>
                <SelectItem value="parking">Parking</SelectItem>
                <SelectItem value="wifi">WiFi/Internet</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )
      default:
        return null
    }
  }

  const renderImagePreview = () => {
    if (formData.image) {
      return (
        <div className="relative">
          <Image
            src={formData.image}
            alt="Preview"
            width={400}
            height={192}
            className="w-full h-48 object-cover rounded-lg"
          />
          <button
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, image: null }))}
            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )
    }
    return null
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="rounded-2xl shadow-2xl border-0 bg-card/80 backdrop-blur">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl gradient-text">Submit Grievance</CardTitle>
              <CardDescription>
                Step {step} of {totalSteps}
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <Progress value={progress} className="mt-4" />
        </CardHeader>
        <CardContent className="space-y-6">
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Personal Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    placeholder="3-20 characters"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="rounded-xl"
                    maxLength={20}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    placeholder="3-20 characters"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="rounded-xl"
                    maxLength={20}
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
                  disabled
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
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Contact Information</h3>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Use @srmist.edu.in or max 6 characters"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="rounded-xl"
                />
                <p className="text-xs text-muted-foreground">
                  Use your official SRM email (@srmist.edu.in) or enter a short email (≤6 characters)
                </p>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Issue Details</h3>
              <div className="space-y-2">
                <Label htmlFor="issueType">Issue Type *</Label>
                <Select
                  value={formData.issueType}
                  onValueChange={(value) => setFormData({ ...formData, issueType: value })}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Select issue type" />
                  </SelectTrigger>
                  <SelectContent>
                    {issueTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {renderConditionalFields()}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Message & Attachments</h3>
              <div className="space-y-2">
                <Label htmlFor="message">Describe your issue *</Label>
                <Textarea
                  id="message"
                  placeholder="Describe your grievance in detail (max 355 characters)"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="rounded-xl min-h-[120px]"
                  maxLength={355}
                />
                <p className="text-xs text-muted-foreground text-right">{formData.message.length}/355 characters</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="image">Upload Image (Optional)</Label>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-xl p-6 text-center">
                  <input
                    id="image"
                    type="file"
                    accept="image/jpeg,image/png"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <label htmlFor="image" className="cursor-pointer">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Click to upload JPG or PNG (max 5MB)</p>
                    {renderImagePreview()}
                  </label>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between pt-6">
            <Button
              variant="outline"
              onClick={() => (step > 1 ? setStep(step - 1) : onCancel())}
              className="rounded-xl"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {step > 1 ? "Previous" : "Cancel"}
            </Button>

            {step < totalSteps ? (
              <Button
                onClick={handleNext}
                disabled={!validateStep(step)}
                className="rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={loading || !validateStep(4)}
                className="rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                {loading ? (
                  "Submitting..."
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Submit Grievance
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
