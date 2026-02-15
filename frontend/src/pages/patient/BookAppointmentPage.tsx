import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function BookAppointmentPage() {
  const { user } = useAuth()
  const [symptoms, setSymptoms] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!symptoms.trim()) return

    setSubmitting(true)
    setError(null)
    setSuccess(false)

    const { error: insertError } = await supabase
      .from('appointment_requests')
      .insert({ patient_id: user?.id, symptoms: symptoms.trim() })

    if (insertError) {
      setError(insertError.message)
    } else {
      setSuccess(true)
      setSymptoms('')
    }
    setSubmitting(false)
  }

  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold mb-6">Book Appointment</h2>
      <Card>
        <CardHeader>
          <CardTitle>Describe your symptoms</CardTitle>
          <CardDescription>
            Describe what you're experiencing and a doctor will get back to you.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="symptoms">Symptoms</Label>
              <Textarea
                id="symptoms"
                placeholder="Describe what you're experiencing..."
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                rows={6}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            {success && (
              <p className="text-sm text-green-600">Submitted</p>
            )}
            <Button type="submit" disabled={submitting || !symptoms.trim()}>
              {submitting ? 'Submitting...' : 'Submit Request'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
