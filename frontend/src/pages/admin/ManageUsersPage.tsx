import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus } from 'lucide-react'

interface UserProfile {
  id: string
  role: string | null
  first_name: string | null
  last_name: string | null
  phone: string | null
  email?: string
}

export default function ManageUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)

  // Create user form
  const [newEmail, setNewEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newFirstName, setNewFirstName] = useState('')
  const [newLastName, setNewLastName] = useState('')
  const [newRole, setNewRole] = useState<string>('patient')
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  async function fetchUsers() {
    const { data } = await supabase.rpc('get_all_profiles')

    setUsers(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleRoleChange = async (userId: string, role: string) => {
    await supabase.rpc('admin_update_profile', {
      target_id: userId,
      new_role: role,
    })

    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role } : u))
    )
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    setCreateError(null)

    // Save current admin session before creating new user
    const { data: currentSession } = await supabase.auth.getSession()

    const { data, error } = await supabase.auth.signUp({
      email: newEmail,
      password: newPassword,
    })

    if (error) {
      setCreateError(error.message)
      setCreating(false)
      return
    }

    // Restore admin session (signUp switches to the new user)
    if (currentSession.session) {
      await supabase.auth.setSession({
        access_token: currentSession.session.access_token,
        refresh_token: currentSession.session.refresh_token,
      })
    }

    if (data.user) {
      await supabase.rpc('admin_update_profile', {
        target_id: data.user.id,
        new_role: newRole,
        new_first_name: newFirstName || null,
        new_last_name: newLastName || null,
      })
    }

    setNewEmail('')
    setNewPassword('')
    setNewFirstName('')
    setNewLastName('')
    setNewRole('patient')
    setCreating(false)
    setDialogOpen(false)
    await fetchUsers()
  }

  const roleBadgeVariant = (role: string | null) => {
    switch (role) {
      case 'admin': return 'destructive' as const
      case 'doctor': return 'default' as const
      case 'patient': return 'secondary' as const
      default: return 'outline' as const
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Manage Users</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>First Name</Label>
                  <Input value={newFirstName} onChange={(e) => setNewFirstName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Last Name</Label>
                  <Input value={newLastName} onChange={(e) => setNewLastName(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Password</Label>
                <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={6} />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={newRole} onValueChange={setNewRole}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="patient">Patient</SelectItem>
                    <SelectItem value="doctor">Doctor</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {createError && <p className="text-sm text-destructive">{createError}</p>}
              <Button type="submit" className="w-full" disabled={creating}>
                {creating ? 'Creating...' : 'Create User'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
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
                <TableHead>Role</TableHead>
                <TableHead>Change Role</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    No users found.
                  </TableCell>
                </TableRow>
              ) : (
                users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>{u.first_name ?? '—'} {u.last_name ?? ''}</TableCell>
                    <TableCell>{u.phone ?? '—'}</TableCell>
                    <TableCell>
                      <Badge variant={roleBadgeVariant(u.role)}>
                        {u.role ?? 'unassigned'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Select value={u.role ?? ''} onValueChange={(val) => handleRoleChange(u.id, val)}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="patient">Patient</SelectItem>
                          <SelectItem value="doctor">Doctor</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
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
