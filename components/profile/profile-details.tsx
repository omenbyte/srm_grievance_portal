import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { User, Phone, Mail, FileText } from "lucide-react"

interface ProfileProps {
  profile: {
    firstName: string
    lastName: string
    mobile: string
    registrationNo: string
    email: string
  }
}

export function ProfileDetails({ profile }: ProfileProps) {
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6">
        <Avatar className="h-24 w-24 border-4 border-background">
          <AvatarFallback className="text-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            {getInitials(profile.firstName, profile.lastName)}
          </AvatarFallback>
        </Avatar>
        <div className="text-center sm:text-left">
          <h2 className="text-2xl font-bold">
            {profile.firstName} {profile.lastName}
          </h2>
          <p className="text-muted-foreground">Student</p>
        </div>
      </div>

      <div className="grid gap-4">
        <Card className="p-4 rounded-xl bg-background/50">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
              <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Full Name</p>
              <p className="font-medium">
                {profile.firstName} {profile.lastName}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 rounded-xl bg-background/50">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center shrink-0">
              <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Registration Number</p>
              <p className="font-medium">{profile.registrationNo}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 rounded-xl bg-background/50">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
              <Mail className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email Address</p>
              <p className="font-medium">{profile.email}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 rounded-xl bg-background/50">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
              <Phone className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Mobile Number</p>
              <p className="font-medium">+91 {profile.mobile}</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
