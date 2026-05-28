import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import Navbar from '../components/Navbar'
import { StatusBadge, PriorityBadge } from '../components/StatusBadge'

const CATEGORIES = ['IT', 'HR', 'Facilities', 'Other']
const PRIORITIES = ['low', 'medium', 'high']

export default function EmployeeTickets() {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', category: 'IT', priority: 'medium' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const fetchTickets = async () => {
    try {
      const { data } = await api.get('/tickets/')
      setTickets(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
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
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 24px' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#0f172a', margin: 0 }}>My Tickets</h1>
            <p style={{ color: '#64748b', fontSize: '14px', margin: '4px 0 0' }}>{tickets.length} ticket{tickets.length !== 1 ? 's' : ''}</p>
          </div>
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
            marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
            border: '1px solid #e2e8f0',
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
                  {PRIORITIES.map(p => <option key={p} value={p} style={{ textTransform: 'capitalize' }}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
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
                }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tickets Table structure */}
        {loading ? (
          <p style={{ color: '#94a3b8' }}>Loading...</p>
        ) : tickets.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>📭</div>
            <p>No tickets yet. Create your first one!</p>
          </div>
        ) : (
          <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            {/* Table Header */}
            <div style={{
              display: 'grid', gridTemplateColumns: '60px 2fr 1fr 1fr',
              padding: '12px 20px', background: '#f8fafc',
              borderBottom: '1px solid #e2e8f0', fontSize: '12px',
              fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px',
            }}>
              <span>ID</span><span>Title</span><span>Priority</span><span>Status</span>
            </div>

            {/* Table Body */}
            <div>
              {tickets.map((t, i) => (
                <div key={t.id} onClick={() => navigate(`/tickets/${t.id}`)}
                  style={{
                    display: 'grid', gridTemplateColumns: '60px 2fr 1fr 1fr',
                    padding: '14px 20px', alignItems: 'center',
                    borderBottom: i < tickets.length - 1 ? '1px solid #f1f5f9' : 'none',
                    cursor: 'pointer', transition: 'background 0.1s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                  onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                >
                  <span style={{ fontWeight: 600, fontSize: '14px', color: '#64748b' }}>{t.id}</span>
                  <div>
                    <p style={{ fontWeight: 600, color: '#0f172a', margin: '0 0 4px', fontSize: '15px' }}>{t.title}</p>
                    <p style={{ color: '#64748b', fontSize: '12px', margin: 0 }}>
                      {t.category} · {new Date(t.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div style={{ display: 'flex' }}>
                    <PriorityBadge priority={t.priority} />
                  </div>
                  <div style={{ display: 'flex' }}>
                    <StatusBadge status={t.status} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}