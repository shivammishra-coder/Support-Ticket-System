import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

import LoginPage             from './pages/LoginPage'
import RegisterPage          from './pages/RegisterPage'
import EmployeeTickets       from './pages/EmployeeTickets'
import EmployeeTicketDetail  from './pages/EmployeeTicketDetail'
import AgentQueue            from './pages/AgentQueue'
import AgentTicketDetail     from './pages/AgentTicketDetail'
import AdminTicketList       from './pages/AdminTicketList'
import AdminDashboard        from './pages/AdminDashboard'

function HomeRedirect() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (user.role === 'admin') return <Navigate to="/admin/tickets" replace />
  if (user.role === 'support_agent') return <Navigate to="/agent/queue" replace />
  return <Navigate to="/my-tickets" replace />
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />

          {/* Home redirect */}
          <Route path="/" element={<HomeRedirect />} />

          {/* Employee */}
          <Route path="/my-tickets" element={
            <ProtectedRoute roles={['employee', 'support_agent', 'admin']}>
              <EmployeeTickets />
            </ProtectedRoute>
          } />
          <Route path="/tickets/:id" element={
            <ProtectedRoute roles={['employee', 'support_agent', 'admin']}>
              <EmployeeTicketDetail />
            </ProtectedRoute>
          } />

          {/* Agent */}
          <Route path="/agent/queue" element={
            <ProtectedRoute roles={['support_agent', 'admin']}>
              <AgentQueue />
            </ProtectedRoute>
          } />
          <Route path="/agent/tickets/:id" element={
            <ProtectedRoute roles={['support_agent', 'admin']}>
              <AgentTicketDetail />
            </ProtectedRoute>
          } />

          {/* Admin */}
          <Route path="/admin/tickets" element={
            <ProtectedRoute roles={['admin']}>
              <AdminTicketList />
            </ProtectedRoute>
          } />
          <Route path="/admin/tickets/:id" element={
            <ProtectedRoute roles={['admin']}>
              <AgentTicketDetail />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/admin" element={
            <ProtectedRoute roles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/agent" element={
            <ProtectedRoute roles={['support_agent', 'admin']}>
              <AgentQueue />
            </ProtectedRoute>
          } />

          {/* Admin-only register page */}
          <Route path="/admin/register" element={
            <ProtectedRoute roles={['admin']}>
              <RegisterPage />
            </ProtectedRoute>
          } />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}