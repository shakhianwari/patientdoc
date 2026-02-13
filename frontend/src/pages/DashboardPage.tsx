import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Calendar } from "@/components/ui/calendar"
import { useState } from "react"


export default function DashboardPage() {
  const { user, signOut } = useAuth()
    const [date, setDate] = useState<Date | undefined>(new Date())


    return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">PatientDoc</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user?.email}</span>
            <Button variant="outline" onClick={signOut}>Sign out</Button>
          </div>
            <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-lg border"
            />
        </div>
        <p className="text-muted-foreground">Welcome to PatientDoc. Your dashboard will go here.</p>
      </div>
    </div>
  )
}
