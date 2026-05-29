import { useState, useEffect } from 'react'
import api from '../api/axios'
import Navbar from '../components/Navbar'
import TicketTable from '../components/TicketTable'
import { useAuth } from '../context/AuthContext'

export default function AgentQueue() {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  const fetchTickets = () => {
    api.get('/tickets/')
      .then(r => setTickets(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchTickets() }, [])

  const handleSelfAssign = async (ticketId) => {
    try {
      await api.put(`/tickets/${ticketId}/assign`, { assigned_to_id: user.id })
      fetchTickets()
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to assign')
    }
  }

  // Assign Me button rendered per row
  const assignAction = (ticket) => {
    if (ticket.assigned_to) return <span style={{ fontSize: '12px', color: '#cbd5e1' }}>—</span>
    return (
      <button
        onClick={() => handleSelfAssign(ticket.id)}
        style={{
          background: '#eff6ff', color: '#3b82f6', border: '1px solid #bfdbfe',
          padding: '5px 10px', borderRadius: '6px', fontSize: '12px',
          fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
        }}
      >
        Assign Me
      </button>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: "'DM Sans', sans-serif" }}>
      <Navbar />
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ marginBottom: '20px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#0f172a', margin: 0 }}>Ticket Queue</h1>
        </div>
        <TicketTable
          tickets={tickets}
          loading={loading}
          linkPrefix="/agent/tickets"
          showAssigned={true}
          showAuthor={false}
          extraActions={assignAction}
        />
      </div>
    </div>
  )
}