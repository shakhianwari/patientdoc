import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { format } from 'date-fns'

interface Patient {
  id: string
  first_name: string | null
  last_name: string | null
}

interface Visit {
  id: string
  visit_date: string
  notes: string
  diagnosis: string | null
}

export default function DoctorMedicalRecordsPage() {
  const { user, profile } = useAuth()
  const [patients, setPatients] = useState<Patient[]>([])
  const [selectedPatient, setSelectedPatient] = useState<string>('')
  const [visits, setVisits] = useState<Visit[]>([])
  const [loading, setLoading] = useState(true)
  const [visitsLoading, setVisitsLoading] = useState(false)

  // New record form
  const [notes, setNotes] = useState('')
  const [diagnosis, setDiagnosis] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  useEffect(() => {
    async function fetchPatients() {
      const { data } = await supabase
        .from('doctor_patients')
        .select('patient:profiles(id, first_name, last_name)')
        .eq('doctor_id', user?.id)

      setPatients((data ?? []).map((d: any) => d.patient))
      setLoading(false)
    }
    fetchPatients()
  }, [user?.id])

  useEffect(() => {
    if (!selectedPatient) {
      setVisits([])
      return
    }
    async function fetchVisits() {
      setVisitsLoading(true)
      const { data } = await supabase
        .from('visits')
        .select('id, visit_date, notes, diagnosis')
        .eq('patient_id', selectedPatient)
        .eq('doctor_id', user?.id)
        .order('visit_date', { ascending: false })

      setVisits(data ?? [])
      setVisitsLoading(false)
    }
    fetchVisits()
  }, [selectedPatient, user?.id])

  const handleSaveRecord = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!notes.trim() || !selectedPatient) return

    setSaving(true)
    setSaveSuccess(false)

    const doctorName = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') || 'Unknown'

    await supabase.from('visits').insert({
      patient_id: selectedPatient,
      doctor_id: user?.id,
      doctor_name: doctorName,
      visit_date: new Date().toISOString(),
      notes: notes.trim(),
      diagnosis: diagnosis.trim() || null,
    })

    setSaveSuccess(true)
    setNotes('')
    setDiagnosis('')
    setSaving(false)

    // Refresh visits
    const { data } = await supabase
      .from('visits')
      .select('id, visit_date, notes, diagnosis')
      .eq('patient_id', selectedPatient)
      .eq('doctor_id', user?.id)
      .order('visit_date', { ascending: false })
    setVisits(data ?? [])
  }

  if (loading) return <p className="text-muted-foreground">Loading...</p>

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Medical Records</h2>
      <div className="mb-6 max-w-sm">
        <Label>Select Patient</Label>
        <Select value={selectedPatient} onValueChange={setSelectedPatient}>
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Choose a patient..." />
          </SelectTrigger>
          <SelectContent>
            {patients.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.first_name} {p.last_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedPatient && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">New Record</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveRecord} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Visit notes..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="diagnosis">Diagnosis (optional)</Label>
                  <Input
                    id="diagnosis"
                    placeholder="Diagnosis"
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                  />
                </div>
                {saveSuccess && (
                  <p className="text-sm text-green-600">Record saved.</p>
                )}
                <Button type="submit" disabled={saving || !notes.trim()}>
                  {saving ? 'Saving...' : 'Save Record'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div>
            <h3 className="text-lg font-semibold mb-4">Past Records</h3>
            {visitsLoading ? (
              <p className="text-muted-foreground">Loading...</p>
            ) : visits.length === 0 ? (
              <p className="text-muted-foreground">No records for this patient.</p>
            ) : (
              <div className="space-y-3">
                {visits.map((v) => (
                  <Card key={v.id}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">
                        {format(new Date(v.visit_date), 'PPP')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{v.notes}</p>
                      {v.diagnosis && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Diagnosis: {v.diagnosis}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
