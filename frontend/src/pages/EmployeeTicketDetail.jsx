import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import Navbar from '../components/Navbar'
import { StatusBadge, PriorityBadge } from '../components/StatusBadge'
import CommentThread from '../components/CommentThread'
import HistoryTimeline from '../components/HistoryTimeline'

export default function EmployeeTicketDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [ticket, setTicket] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchAll = async () => {
    try {
      const [tRes, hRes] = await Promise.all([
        api.get(`/tickets/${id}`),
        api.get(`/tickets/${id}/history`),
      ])
      setTicket(tRes.data)
      setHistory(hRes.data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAll() }, [id])

  if (loading) return <div style={{ fontFamily: 'sans-serif', padding: '40px', color: '#94a3b8' }}>Loading...</div>
  if (!ticket) return <div style={{ fontFamily: 'sans-serif', padding: '40px', color: '#ef4444' }}>Ticket not found.</div>

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: "'DM Sans', sans-serif" }}>
      <Navbar />
      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '32px 24px' }}>

        {/* Back */}
        <button onClick={() => navigate('/my-tickets')} style={{
          background: 'none', border: 'none', color: '#64748b', fontSize: '13px',
          cursor: 'pointer', padding: '0 0 16px', display: 'flex', alignItems: 'center', gap: '4px',
        }}>
          ← Back to My Tickets
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
          <div style={{ display: 'flex', gap: '24px', fontSize: '13px', color: '#64748b' }}>
            <span>📁 {ticket.category}</span>
            <span>📅 {new Date(ticket.created_at).toLocaleDateString()}</span>
            {ticket.assigned_to && <span>👤 Assigned to: {ticket.assigned_to.name}</span>}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '16px' }}>
          {/* Comments */}
          <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', border: '1px solid #e2e8f0' }}>
            <CommentThread ticketId={ticket.id} comments={ticket.comments || []} onCommentAdded={fetchAll} />
          </div>

          {/* History */}
          <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px', color: '#1e293b' }}>Status History</h3>
            <HistoryTimeline history={history} />
          </div>
        </div>
      </div>
    </div>
  )
}