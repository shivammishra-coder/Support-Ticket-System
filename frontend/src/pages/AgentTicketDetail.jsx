import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import Navbar from '../components/Navbar'
import { StatusBadge, PriorityBadge } from '../components/StatusBadge'
import CommentThread from '../components/CommentThread'
import HistoryTimeline from '../components/HistoryTimeline'
import { useAuth } from '../context/AuthContext'

// Agent follows strict transitions
const AGENT_TRANSITIONS = {
  open:        ['in_progress'],
  in_progress: ['resolved', 'closed'],
  resolved:    ['in_progress', 'closed'],
  closed:      [],
}

// Admin can move to any status
const ALL_STATUSES = ['open', 'in_progress', 'resolved', 'closed']

const STATUS_LABELS = {
  open: 'Open', in_progress: 'In Progress', resolved: 'Resolved', closed: 'Closed',
}

export default function AgentTicketDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'

  const [ticket, setTicket]             = useState(null)
  const [history, setHistory]           = useState([])
  const [agents, setAgents]             = useState([])
  const [loading, setLoading]           = useState(true)
  const [statusError, setStatusError]   = useState('')
  const [statusLoading, setStatusLoading] = useState(false)
  const [assignValue, setAssignValue]   = useState('')
  const [assignLoading, setAssignLoading] = useState(false)
  const [assignError, setAssignError]   = useState('')
  const [assignSuccess, setAssignSuccess] = useState('')

  const fetchAll = async () => {
    try {
      const [tRes, hRes] = await Promise.all([
        api.get(`/tickets/${id}`),
        api.get(`/tickets/${id}/history`),
      ])
      setTicket(tRes.data)
      setHistory(hRes.data)
      // Pre-select current assigned agent
      if (tRes.data.assigned_to) setAssignValue(String(tRes.data.assigned_to.id))
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  // Fetch all agents for admin assign dropdown
  const fetchAgents = async () => {
    if (!isAdmin) return
    try {
      const { data } = await api.get('/auth/users')
      setAgents(data.filter(u => u.role === 'support_agent'))
    } catch (e) { console.error(e) }
  }

  useEffect(() => {
    fetchAll()
    fetchAgents()
  }, [id])

  // ── Status change ──────────────────────────────────────────
  const handleStatusChange = async (newStatus) => {
    setStatusLoading(true)
    setStatusError('')
    try {
      await api.put(`/tickets/${id}/status`, { status: newStatus })
      fetchAll()
    } catch (e) {
      setStatusError(e.response?.data?.detail || 'Failed to update status')
    } finally {
      setStatusLoading(false)
    }
  }

  // ── Assign ticket ──────────────────────────────────────────
  const handleAssign = async () => {
    if (!assignValue) return
    setAssignLoading(true)
    setAssignError('')
    setAssignSuccess('')
    try {
      await api.put(`/tickets/${id}/assign`, { assigned_to_id: parseInt(assignValue) })
      setAssignSuccess('Ticket assigned successfully!')
      fetchAll()
    } catch (e) {
      setAssignError(e.response?.data?.detail || 'Failed to assign ticket')
    } finally {
      setAssignLoading(false)
    }
  }

  if (loading) return <div style={{ padding: '40px', color: '#94a3b8', fontFamily: 'sans-serif' }}>Loading...</div>
  if (!ticket) return <div style={{ padding: '40px', color: '#ef4444', fontFamily: 'sans-serif' }}>Ticket not found.</div>

  // Agent can only change status if the ticket is assigned to them
  const isAssignedToMe = ticket.assigned_to?.id === user?.id
  const canChangeStatus = isAdmin || isAssignedToMe

  // Which statuses to show as buttons
  const allowedNext = isAdmin
    ? ALL_STATUSES.filter(s => s !== ticket.status)
    : (AGENT_TRANSITIONS[ticket.status] || [])

  const backPath = isAdmin ? '/admin/tickets' : '/agent/queue'
  const backLabel = isAdmin ? '← Back to All Tickets' : '← Back to Queue'

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: "'DM Sans', sans-serif" }}>
      <Navbar />
      <div style={{ maxWidth: '980px', margin: '0 auto', padding: '32px 24px' }}>

        <button onClick={() => navigate(backPath)} style={{
          background: 'none', border: 'none', color: '#64748b', fontSize: '13px',
          cursor: 'pointer', padding: '0 0 16px', display: 'flex', alignItems: 'center', gap: '4px',
        }}>
          {backLabel}
        </button>

        {/* ── Ticket Header ── */}
        <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', marginBottom: '16px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', margin: 0 }}>{ticket.title}</h1>
            <div style={{ display: 'flex', gap: '8px' }}>
              <PriorityBadge priority={ticket.priority} />
              <StatusBadge status={ticket.status} />
            </div>
          </div>

          <p style={{ color: '#475569', fontSize: '14px', lineHeight: '1.6', margin: '0 0 16px' }}>
            {ticket.description}
          </p>

          <div style={{ display: 'flex', gap: '24px', fontSize: '13px', color: '#64748b', flexWrap: 'wrap' }}>
            <span>Category: {ticket.category}</span>
            <span>Raised by: {ticket.created_by.name}</span>
            <span>{new Date(ticket.created_at).toLocaleDateString()}</span>
            <span>Assigned to: {ticket.assigned_to
              ? <strong style={{ color: '#0f172a' }}>{ticket.assigned_to.name}</strong>
              : <span style={{ color: '#94a3b8' }}>Unassigned</span>}
            </span>
          </div>

          {/* ── Status Actions ── */}
          <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
            {canChangeStatus ? (
              <>
                <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 8px', fontWeight: 600 }}>
                  {isAdmin ? 'Change Status:' : 'Move to:'}
                </p>
                {allowedNext.length > 0 ? (
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {allowedNext.map(s => (
                      <button key={s} onClick={() => handleStatusChange(s)} disabled={statusLoading}
                        style={{
                          background: '#0f172a', color: '#fff', border: 'none',
                          padding: '8px 16px', borderRadius: '7px', fontSize: '13px',
                          fontWeight: 500, cursor: 'pointer', opacity: statusLoading ? 0.6 : 1,
                        }}>
                        → {STATUS_LABELS[s]}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>
                    {ticket.status === 'closed' ? 'This ticket is closed.' : 'No transitions available.'}
                  </p>
                )}
                {statusError && (
                  <p style={{ color: '#ef4444', fontSize: '13px', margin: '8px 0 0' }}>
                    ❌ {statusError}
                  </p>
                )}
              </>
            ) : (
              <div style={{
                background: '#fffbeb', border: '1px solid #fde68a',
                borderRadius: '8px', padding: '10px 14px',
                fontSize: '13px', color: '#92400e',
              }}>
                ⚠️ This ticket is not assigned to you.
              </div>
            )}
          </div>

          {/* ── Assign Ticket — Admin Only ── */}
          {isAdmin && (
            <div style={{
              marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #f1f5f9',
            }}>
              <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 10px', fontWeight: 600 }}>
                Assign to Agent:
              </p>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                <select
                  value={assignValue}
                  onChange={e => { setAssignValue(e.target.value); setAssignSuccess(''); setAssignError('') }}
                  style={{
                    padding: '8px 12px', borderRadius: '7px', border: '1px solid #e2e8f0',
                    fontSize: '14px', outline: 'none', background: '#fff',
                    minWidth: '220px', cursor: 'pointer',
                  }}
                >
                  <option value="">— Select an agent —</option>
                  {agents.map(a => (
                    <option key={a.id} value={String(a.id)}>{a.name} ({a.email})</option>
                  ))}
                </select>
                <button
                  onClick={handleAssign}
                  disabled={assignLoading || !assignValue}
                  style={{
                    background: '#3b82f6', color: '#fff', border: 'none',
                    padding: '8px 20px', borderRadius: '7px', fontSize: '13px',
                    fontWeight: 600, cursor: 'pointer',
                    opacity: assignLoading || !assignValue ? 0.5 : 1,
                  }}
                >
                  {assignLoading ? 'Assigning...' : 'Assign'}
                </button>
              </div>
              {assignError   && <p style={{ color: '#ef4444', fontSize: '13px', marginTop: '8px' }}>❌ {assignError}</p>}
              {assignSuccess && <p style={{ color: '#16a34a', fontSize: '13px', marginTop: '8px' }}>✅ {assignSuccess}</p>}
            </div>
          )}
        </div>

        {/* ── Comments + History ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '16px' }}>
          <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', border: '1px solid #e2e8f0' }}>
            <CommentThread ticketId={ticket.id} comments={ticket.comments || []} onCommentAdded={fetchAll} />
          </div>
          <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px', color: '#1e293b' }}>Status History</h3>
            <HistoryTimeline history={history} />
          </div>
        </div>

      </div>
    </div>
  )
}