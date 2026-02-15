import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Search } from 'lucide-react'

interface Patient {
  id: string
  first_name: string | null
  last_name: string | null
  phone: string | null
  email: string | null
}

export default function MyPatientsPage() {
  const { user } = useAuth()
  const [patients, setPatients] = useState<Patient[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchPatients() {
      const { data } = await supabase
        .from('doctor_patients')
        .select('patient:profiles(id, first_name, last_name, phone)')
        .eq('doctor_id', user?.id)

      const mapped = (data ?? []).map((d: any) => ({
        ...d.patient,
        email: null,
      }))
      setPatients(mapped)
      setLoading(false)
    }
    fetchPatients()
  }, [user?.id])

  const filtered = patients.filter((p) => {
    const name = `${p.first_name ?? ''} ${p.last_name ?? ''}`.toLowerCase()
    return name.includes(search.toLowerCase())
  })

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">My Patients</h2>
      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search patients..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>
      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2} className="text-center text-muted-foreground">
                    No patients found.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>{p.first_name} {p.last_name}</TableCell>
                    <TableCell>{p.phone ?? '—'}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
