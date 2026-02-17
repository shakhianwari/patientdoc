import { useAuth } from '@/hooks/useAuth'
import type { UserRole } from '@/context/AuthContext'
import { useLocation, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  CalendarPlus,
  FileText,
  Users,
  MessageSquare,
  CalendarDays,
  Settings,
  BarChart3,
  UserCog,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface MenuItem {
  label: string
  icon: LucideIcon
  path: string
}

const menusByRole: Record<NonNullable<UserRole>, MenuItem[]> = {
  patient: [
    { label: 'Book Appointment', icon: CalendarPlus, path: '/book-appointment' },
    { label: 'Medical Records', icon: FileText, path: '/medical-records' },
  ],
  doctor: [
    { label: 'Appointments', icon: CalendarDays, path: '/appointments' },
    { label: 'My Patients', icon: Users, path: '/my-patients' },
    { label: 'Medical Records', icon: FileText, path: '/doctor-records' },
    { label: 'Messages', icon: MessageSquare, path: '/messages' },
  ],
  admin: [
    { label: 'Manage Users', icon: UserCog, path: '/manage-users' },
    { label: 'Settings', icon: Settings, path: '/settings' },
    { label: 'Analytics', icon: BarChart3, path: '/analytics' },
  ],
}

export default function Sidebar() {
  const { role } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  if (!role) {
    return (
      <aside className="w-56 border-r p-4">
        <p className="text-sm text-muted-foreground">No role assigned. Contact an admin.</p>
      </aside>
    )
  }

  const items = menusByRole[role]

  return (
    <aside className="w-56 border-r p-4">
      <nav className="space-y-1">
        {items.map((item) => (
          <Button
            key={item.path}
            variant={location.pathname === item.path ? 'secondary' : 'ghost'}
            className="w-full justify-start gap-2"
            onClick={() => navigate(item.path)}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Button>
        ))}
      </nav>
    </aside>
  )
}
