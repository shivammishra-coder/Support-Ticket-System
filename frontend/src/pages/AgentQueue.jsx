import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import Navbar from '../components/Navbar'
import { StatusBadge, PriorityBadge } from '../components/StatusBadge'
import { useAuth } from '../context/AuthContext'

export default function AgentQueue() {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const { user } = useAuth()

  useEffect(() => {
    api.get('/tickets/').then(r => setTickets(r.data)).catch(console.error).finally(() => setLoading(false))
  }, [])

  const handleSelfAssign = async (e, ticketId) => {
    e.stopPropagation()
    try {
      await api.put(`/tickets/${ticketId}/assign`, { assigned_to_id: user.id })
      const { data } = await api.get('/tickets/')
      setTickets(data)
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to assign')
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: "'DM Sans', sans-serif" }}>
      <Navbar />
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#0f172a', margin: 0 }}>Ticket Queue</h1>
          <p style={{ color: '#64748b', fontSize: '14px', margin: '4px 0 0' }}>
            {tickets.length} open ticket{tickets.length !== 1 ? 's' : ''} sorted by priority
          </p>
        </div>

        {loading ? <p style={{ color: '#94a3b8' }}>Loading...</p> : tickets.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>✅</div>
            <p>Queue is empty. All caught up!</p>
          </div>
        ) : (
          <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            {/* Table header */}
            <div style={{
              display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr auto',
              padding: '12px 20px', background: '#f8fafc',
              borderBottom: '1px solid #e2e8f0', fontSize: '12px',
              fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px',
            }}>
              <span>Title</span><span>Category</span><span>Priority</span><span>Status</span><span>Assigned To</span><span>Action</span>
            </div>
            {tickets.map((t, i) => (
              <div key={t.id}
                onClick={() => navigate(`/agent/tickets/${t.id}`)}
                style={{
                  display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr auto',
                  padding: '14px 20px', alignItems: 'center',
                  borderBottom: i < tickets.length - 1 ? '1px solid #f1f5f9' : 'none',
                  cursor: 'pointer', transition: 'background 0.1s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                onMouseLeave={e => e.currentTarget.style.background = '#fff'}
              >
                <span style={{ fontWeight: 600, fontSize: '14px', color: '#0f172a' }}>{t.title}</span>
                <span style={{ fontSize: '13px', color: '#64748b' }}>{t.category}</span>
                <PriorityBadge priority={t.priority} />
                <StatusBadge status={t.status} />
                <span style={{ fontSize: '13px', color: '#64748b' }}>
                  {t.assigned_to ? t.assigned_to.name : <span style={{ color: '#94a3b8' }}>Unassigned</span>}
                </span>
                {!t.assigned_to && (
                  <button
                    onClick={(e) => handleSelfAssign(e, t.id)}
                    style={{
                      background: '#eff6ff', color: '#3b82f6', border: '1px solid #bfdbfe',
                      padding: '5px 12px', borderRadius: '6px', fontSize: '12px',
                      fontWeight: 600, cursor: 'pointer',
                    }}
                  >
                    Assign Me
                  </button>
                )}
                {t.assigned_to && <span style={{ fontSize: '12px', color: '#94a3b8' }}>—</span>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}