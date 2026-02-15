import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'

interface Appointment {
  id: string
  appointment_date: string
  patient_name: string
  symptoms: string
  status: string
}

export default function AppointmentsPage() {
  const { user } = useAuth()
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAppointments() {
      const { data } = await supabase
        .from('appointments')
        .select('id, appointment_date, patient_name, symptoms, status')
        .eq('doctor_id', user?.id)
        .order('appointment_date', { ascending: true })

      setAppointments(data ?? [])
      setLoading(false)
    }
    fetchAppointments()
  }, [user?.id])

  const filteredAppointments = date
    ? appointments.filter(
        (a) => format(new Date(a.appointment_date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
      )
    : appointments

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Appointments</h2>
      <div className="flex gap-8">
        <div>
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-lg border"
          />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-4">
            {date ? format(date, 'PPP') : 'All Appointments'}
          </h3>
          {loading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : filteredAppointments.length === 0 ? (
            <p className="text-muted-foreground">No appointments for this date.</p>
          ) : (
            <div className="space-y-3">
              {filteredAppointments.map((apt) => (
                <Card key={apt.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{apt.patient_name}</CardTitle>
                      <Badge variant="outline">{apt.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{apt.symptoms}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(new Date(apt.appointment_date), 'p')}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
