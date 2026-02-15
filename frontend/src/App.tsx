import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import LoginPage from '@/pages/LoginPage'
import DashboardPage from '@/pages/DashboardPage'

// Patient pages
import BookAppointmentPage from '@/pages/patient/BookAppointmentPage'
import PatientMedicalRecordsPage from '@/pages/patient/MedicalRecordsPage'

// Doctor pages
import AppointmentsPage from '@/pages/doctor/AppointmentsPage'
import MyPatientsPage from '@/pages/doctor/MyPatientsPage'
import DoctorMedicalRecordsPage from '@/pages/doctor/MedicalRecordsPage'
import MessagesPage from '@/pages/doctor/MessagesPage'

// Admin pages
import ManageUsersPage from '@/pages/admin/ManageUsersPage'
import SettingsPage from '@/pages/admin/SettingsPage'
import AnalyticsPage from '@/pages/admin/AnalyticsPage'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) return null

  if (!user) return <Navigate to="/login" replace />

  return children
}

function App() {
  const { user, loading } = useAuth()

  if (loading) return null

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route path="/" element={
        <ProtectedRoute>
          <DashboardPage />
        </ProtectedRoute>
      }>
        {/* Patient routes */}
        <Route path="book-appointment" element={<BookAppointmentPage />} />
        <Route path="medical-records" element={<PatientMedicalRecordsPage />} />

        {/* Doctor routes */}
        <Route path="appointments" element={<AppointmentsPage />} />
        <Route path="my-patients" element={<MyPatientsPage />} />
        <Route path="doctor-records" element={<DoctorMedicalRecordsPage />} />
        <Route path="messages" element={<MessagesPage />} />

        {/* Admin routes */}
        <Route path="manage-users" element={<ManageUsersPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
      </Route>
    </Routes>
  )
}

export default App
