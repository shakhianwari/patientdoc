import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'

interface Visit {
  id: string
  visit_date: string
  doctor_name: string
  notes: string
  diagnosis: string | null
}

export default function PatientMedicalRecordsPage() {
  const { user } = useAuth()
  const [visits, setVisits] = useState<Visit[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchVisits() {
      const { data } = await supabase
        .from('visits')
        .select('id, visit_date, doctor_name, notes, diagnosis')
        .eq('patient_id', user?.id)
        .order('visit_date', { ascending: false })

      setVisits(data ?? [])
      setLoading(false)
    }
    fetchVisits()
  }, [user?.id])

  if (loading) return <p className="text-muted-foreground">Loading...</p>

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Medical Records</h2>
      {visits.length === 0 ? (
        <p className="text-muted-foreground">Nothing here yet.</p>
      ) : (
        <div className="space-y-4">
          {visits.map((visit) => (
            <Card key={visit.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    {format(new Date(visit.visit_date), 'PPP')}
                  </CardTitle>
                  {visit.diagnosis && <Badge variant="secondary">{visit.diagnosis}</Badge>}
                </div>
                <p className="text-sm text-muted-foreground">Dr. {visit.doctor_name}</p>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{visit.notes}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
