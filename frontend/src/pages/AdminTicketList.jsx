import { useState, useEffect } from 'react'
import api from '../api/axios'
import Navbar from '../components/Navbar'
import TicketTable from '../components/TicketTable'

export default function AdminTicketList() {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/tickets/')
      .then(r => setTickets(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: "'DM Sans', sans-serif" }}>
      <Navbar />
      <div style={{ maxWidth: '1300px', margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ marginBottom: '20px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#0f172a', margin: 0 }}>All Tickets</h1>
        </div>
        <TicketTable
          tickets={tickets}
          loading={loading}
          linkPrefix="/admin/tickets"
          showAssigned={true}
          showAuthor={true}
        />
      </div>
    </div>
  )
}