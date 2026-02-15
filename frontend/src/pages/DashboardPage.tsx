import { Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Calendar } from "@/components/ui/calendar"
import Sidebar from '@/components/Sidebar'
import { useState } from "react"

export default function DashboardPage() {
  const { user, signOut } = useAuth()
  const [date, setDate] = useState<Date | undefined>(new Date())
  const location = useLocation()
  const isRoot = location.pathname === '/'

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b px-6 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">PatientDoc</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">{user?.email}</span>
          <Button variant="outline" size="sm" onClick={signOut}>Sign out</Button>
        </div>
      </header>
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6">
          {isRoot ? (
            <div className="flex gap-8">
              <div className="flex-1">
                <p className="text-muted-foreground">Dashboard</p>
              </div>
              <div>
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="rounded-lg border"
                />
              </div>
            </div>
          ) : (
            <Outlet />
          )}
        </main>
      </div>
    </div>
  )
}
