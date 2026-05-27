import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children, roles }) {
  const { user } = useAuth()

  if (!user) return <Navigate to="/login" replace />

  if (roles && !roles.includes(user.role)) {
    // Redirect to their correct home page
    if (user.role === 'admin') return <Navigate to="/admin/tickets" replace />
    if (user.role === 'support_agent') return <Navigate to="/agent/queue" replace />
    return <Navigate to="/my-tickets" replace />
  }

  return children
}