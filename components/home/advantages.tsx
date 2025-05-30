import { Card, CardContent } from "@/components/ui/card"
import { platformAdvantages } from "@/lib/constants"
import { FileText, Activity, Shield, CheckCircle } from "lucide-react"

export function PlatformAdvantages() {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "FileText":
        return <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
      case "Activity":
        return <Activity className="h-6 w-6 text-purple-600 dark:text-purple-400" />
      case "Shield":
        return <Shield className="h-6 w-6 text-green-600 dark:text-green-400" />
      case "CheckCircle":
        return <CheckCircle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
      default:
        return <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
    }
  }

  return (
    <div className="mt-16 mb-8">
      <h2 className="text-2xl font-bold text-center mb-8">Why Use Our Platform?</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {platformAdvantages.map((advantage) => (
          <Card key={advantage.id} className="rounded-2xl shadow-lg border-0 bg-card/80 backdrop-blur-md">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 flex items-center justify-center mb-4">
                {getIcon(advantage.icon)}
              </div>
              <h3 className="font-medium mb-2">{advantage.title}</h3>
              <p className="text-sm text-muted-foreground">{advantage.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
