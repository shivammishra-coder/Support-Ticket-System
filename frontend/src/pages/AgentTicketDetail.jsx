import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import Navbar from '../components/Navbar'
import { StatusBadge, PriorityBadge } from '../components/StatusBadge'
import CommentThread from '../components/CommentThread'
import HistoryTimeline from '../components/Historytimeline'
import { useAuth } from '../context/AuthContext' // 1. Imported useAuth

const ALLOWED_TRANSITIONS = {
  open: ['in_progress'],
  in_progress: ['resolved', 'closed'],
  resolved: ['in_progress', 'closed'],
  closed: [],
}

export default function AgentTicketDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth() // 2. Destructured user
  const [ticket, setTicket] = useState(null)
  const [history, setHistory] = useState([])
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusError, setStatusError] = useState('')
  const [statusLoading, setStatusLoading] = useState(false)

  const fetchAll = async () => {
    try {
      const [tRes, hRes, cRes] = await Promise.all([
        api.get(`/tickets/${id}`),
        api.get(`/tickets/${id}/history`),
        api.get(`/tickets/${id}/comments`),
      ])
      setTicket(tRes.data)
      setHistory(hRes.data)
      setComments(cRes.data)
    } catch (e) { 
      console.error(e) 
    } finally { 
      setLoading(false) 
    }
  }

  useEffect(() => { fetchAll() }, [id])

  const handleStatusChange = async (newStatus) => {
    // Optional fallback safety check
    if (!ticket.assigned_to || !user || ticket.assigned_to.id !== user.id) {
      setStatusError("You are not authorized to change this ticket's status.")
      return
    }

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

  if (loading) return <div style={{ padding: '40px', color: '#94a3b8', fontFamily: 'sans-serif' }}>Loading...</div>
  if (!ticket) return <div style={{ padding: '40px', color: '#ef4444', fontFamily: 'sans-serif' }}>Ticket not found.</div>

  const allowedNext = ALLOWED_TRANSITIONS[ticket.status] || []
  const STATUS_LABELS = { in_progress: 'In Progress', resolved: 'Resolved', closed: 'Closed', open: 'Open' }
  
  // Check if the current user is the owner of the ticket
  const isAssignedToMe = ticket.assigned_to && user && ticket.assigned_to.id === user.id

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: "'DM Sans', sans-serif" }}>
      <Navbar />
      <div style={{ maxWidth: '980px', margin: '0 auto', padding: '32px 24px' }}>

        <button onClick={() => navigate('/agent/queue')} style={{
          background: 'none', border: 'none', color: '#64748b', fontSize: '13px',
          cursor: 'pointer', padding: '0 0 16px', display: 'flex', alignItems: 'center', gap: '4px',
        }}>
          ← Back to Queue
        </button>

        {/* Header */}
        <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', marginBottom: '16px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', margin: 0 }}>{ticket.title}</h1>
            <div style={{ display: 'flex', gap: '8px' }}>
              <PriorityBadge priority={ticket.priority} />
              <StatusBadge status={ticket.status} />
            </div>
          </div>
          <p style={{ color: '#475569', fontSize: '14px', lineHeight: '1.6', margin: '0 0 16px' }}>{ticket.description}</p>
          <div style={{ display: 'flex', gap: '24px', fontSize: '13px',color: '#64748b', flexWrap: 'wrap' }}>
            <span> <b>Category:</b>{ticket.category}</span>
            <span> <b>Raised by:</b> {ticket.created_by.name}</span>
            <span><b>Created on:</b> {new Date(ticket.created_at).toLocaleDateString()}</span>
            {ticket.assigned_to && <span> <b>Assigned to:</b> {ticket.assigned_to.name}</span>}
          </div>

          {/* Status Actions (Conditional Check) */}
          {isAssignedToMe ? (
            allowedNext.length > 0 && (
              <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
                <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 8px', fontWeight: 500 }}>Move to:</p>
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
                {statusError && <p style={{ color: '#ef4444', fontSize: '13px', marginTop: '8px' }}>{statusError}</p>}
              </div>
            )
          ) : (
            <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
              <p style={{ fontSize: '13px', color: '#64748b', fontStyle: 'italic', margin: 0 }}>
                🔒 Only the assigned agent can modify this ticket's status.
              </p>
            </div>
          )}

          {ticket.status === 'closed' && (
            <p style={{ marginTop: '12px', fontSize: '13px', color: '#94a3b8' }}>This ticket is closed.</p>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '16px' }}>
          <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', border: '1px solid #e2e8f0' }}>
            <CommentThread ticketId={ticket.id} comments={comments} onCommentAdded={fetchAll} />
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