import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import Navbar from '../components/Navbar'
import { StatusBadge, PriorityBadge } from '../components/StatusBadge'
import { useAuth } from '../context/AuthContext'

export default function AgentDashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        setError('')
        
        // This matches your @router.get("/agent") backend endpoint
        const response = await api.get('/dashboard/agent') 
        setTickets(response.data)
      } catch (e) {
        console.error(e)
        setError(e.response?.data?.detail || 'Failed to load dashboard data.')
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchDashboardData()
    }
  }, [user])

  if (loading) {
    return <div style={{ padding: '40px', color: '#94a3b8', fontFamily: 'sans-serif' }}>Loading Agent Dashboard...</div>
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: "'DM Sans', sans-serif" }}>
      <Navbar />
      
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
        
        {/* Welcome Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '26px', fontWeight: 700, color: '#0f172a', margin: '0 0 6px' }}>
            Welcome back, {user?.name || 'Agent'} 👋
          </h1>
          <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
            Here are your active, assigned open and in-progress tickets.
          </p>
        </div>

        {error && (
          <div style={{ padding: '12px 16px', background: '#fef2f2', color: '#ef4444', borderRadius: '8px', marginBottom: '24px', fontSize: '14px' }}>
            ⚠️ {error}
          </div>
        )}

        {/* Dashboard Grid / Stats overview can go here later if backend expands */}
        <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0', background: '#fff' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#1e293b', margin: 0 }}>
              Your Active Focus List ({tickets.length})
            </h2>
          </div>

          {tickets.length === 0 ? (
            <div style={{ padding: '56px 24px', textAlign: 'center', color: '#64748b' }}>
              <p style={{ margin: '0 0 8px', fontSize: '16px', fontWeight: 600, color: '#334155' }}>
                No active tickets! 🎉
              </p>
              <p style={{ margin: 0, fontSize: '14px', color: '#94a3b8' }}>
                You have no open or in-progress tickets assigned directly to you right now.
              </p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 600 }}>
                    <th style={{ padding: '14px 20px' }}>Ticket Info</th>
                    <th style={{ padding: '14px 20px' }}>Category</th>
                    <th style={{ padding: '14px 20px' }}>Priority</th>
                    <th style={{ padding: '14px 20px' }}>Status</th>
                    <th style={{ padding: '14px 20px' }}>Date Created</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map((ticket) => (
                    <tr 
                      key={ticket.id} 
                      onClick={() => navigate(`/agent/tickets/${ticket.id}`)}
                      style={{ 
                        borderBottom: '1px solid #f1f5f9', 
                        cursor: 'pointer',
                        transition: 'background 0.15s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ fontWeight: 600, color: '#0f172a', marginBottom: '4px' }}>{ticket.title}</div>
                        <div style={{ color: '#64748b', fontSize: '13px' }}>User: {ticket.created_by?.name}</div>
                      </td>
                      <td style={{ padding: '16px 20px', color: '#334155' }}>
                        📁 {ticket.category}
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <PriorityBadge priority={ticket.priority} />
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <StatusBadge status={ticket.status} />
                      </td>
                      <td style={{ padding: '16px 20px', color: '#64748b', fontSize: '13px' }}>
                        {new Date(ticket.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}