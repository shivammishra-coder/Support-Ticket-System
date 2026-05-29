import { useState, useEffect } from 'react'
import api from '../api/axios'
import Navbar from '../components/Navbar'
import TicketTable from '../components/TicketTable'

const CATEGORIES = ['IT', 'HR', 'Facilities', 'Other']
const PRIORITIES = ['low', 'medium', 'high']

export default function EmployeeTickets() {
  const [tickets, setTickets]     = useState([])
  const [loading, setLoading]     = useState(true)
  const [showForm, setShowForm]   = useState(false)
  const [form, setForm]           = useState({ title: '', description: '', category: 'IT', priority: 'medium' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]         = useState('')

  const fetchTickets = async () => {
    try {
      const { data } = await api.get('/tickets/')
      setTickets(data)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchTickets() }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      await api.post('/tickets/', form)
      setForm({ title: '', description: '', category: 'IT', priority: 'medium' })
      setShowForm(false)
      fetchTickets()
    } catch (e) {
      setError(e.response?.data?.detail || 'Failed to create ticket')
    } finally {
      setSubmitting(false)
    }
  }

  const inputStyle = {
    width: '100%', padding: '9px 12px', borderRadius: '7px',
    border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none',
    boxSizing: 'border-box', fontFamily: 'inherit',
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: "'DM Sans', sans-serif" }}>
      <Navbar />
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#0f172a', margin: 0 }}>My Tickets</h1>
          <button onClick={() => setShowForm(!showForm)} style={{
            background: '#0f172a', color: '#fff', border: 'none',
            padding: '10px 20px', borderRadius: '8px', fontSize: '14px',
            fontWeight: 600, cursor: 'pointer',
          }}>
            + New Ticket
          </button>
        </div>

        {/* Create Ticket Form */}
        {showForm && (
          <div style={{
            background: '#fff', borderRadius: '12px', padding: '24px',
            marginBottom: '20px', border: '1px solid #e2e8f0',
          }}>
            <h2 style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 20px', color: '#0f172a' }}>Create New Ticket</h2>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                placeholder="Title" required style={inputStyle} />
              <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="Describe your issue..." required rows={3}
                style={{ ...inputStyle, resize: 'vertical' }} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} style={inputStyle}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })} style={inputStyle}>
                  {PRIORITIES.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                </select>
              </div>
              {error && <p style={{ color: '#ef4444', fontSize: '13px', margin: 0 }}>{error}</p>}
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" disabled={submitting} style={{
                  background: '#3b82f6', color: '#fff', border: 'none',
                  padding: '9px 20px', borderRadius: '7px', fontSize: '14px',
                  fontWeight: 600, cursor: 'pointer', opacity: submitting ? 0.7 : 1,
                }}>
                  {submitting ? 'Creating...' : 'Create Ticket'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} style={{
                  background: '#f1f5f9', color: '#475569', border: 'none',
                  padding: '9px 20px', borderRadius: '7px', fontSize: '14px', cursor: 'pointer',
                }}>Cancel</button>
              </div>
            </form>
          </div>
        )}

        <TicketTable
          tickets={tickets}
          loading={loading}
          linkPrefix="/tickets"
          showAssigned={true}
          showAuthor={false}
        />
      </div>
    </div>
  )
}