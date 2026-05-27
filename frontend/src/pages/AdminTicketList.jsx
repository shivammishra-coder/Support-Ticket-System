import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import Navbar from '../components/Navbar'
import { StatusBadge, PriorityBadge } from '../components/StatusBadge'

export default function AdminTicketList() {
  const [tickets, setTickets] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ status: '', priority: '', category: '', agent: '' })
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/tickets/').then(r => { setTickets(r.data); setFiltered(r.data) }).catch(console.error).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    let result = tickets
    if (filters.status)   result = result.filter(t => t.status === filters.status)
    if (filters.priority) result = result.filter(t => t.priority === filters.priority)
    if (filters.category) result = result.filter(t => t.category === filters.category)
    if (filters.agent)    result = result.filter(t => t.assigned_to?.name.toLowerCase().includes(filters.agent.toLowerCase()))
    setFiltered(result)
  }, [filters, tickets])

  const selectStyle = {
    padding: '8px 12px', borderRadius: '7px', border: '1px solid #e2e8f0',
    fontSize: '13px', outline: 'none', background: '#fff', cursor: 'pointer',
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: "'DM Sans', sans-serif" }}>
      <Navbar />
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#0f172a', margin: 0 }}>All Tickets</h1>
          <p style={{ color: '#64748b', fontSize: '14px', margin: '4px 0 0' }}>
            Showing {filtered.length} of {tickets.length} tickets
          </p>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <select value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })} style={selectStyle}>
            <option value="">All Statuses</option>
            {['open', 'in_progress', 'resolved', 'closed'].map(s => (
              <option key={s} value={s}>{s.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>
            ))}
          </select>
          <select value={filters.priority} onChange={e => setFilters({ ...filters, priority: e.target.value })} style={selectStyle}>
            <option value="">All Priorities</option>
            {['high', 'medium', 'low'].map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
          </select>
          <select value={filters.category} onChange={e => setFilters({ ...filters, category: e.target.value })} style={selectStyle}>
            <option value="">All Categories</option>
            {['IT', 'HR', 'Facilities', 'Other'].map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <input value={filters.agent} onChange={e => setFilters({ ...filters, agent: e.target.value })}
            placeholder="Search agent..." style={{ ...selectStyle, cursor: 'text' }} />
          {Object.values(filters).some(Boolean) && (
            <button onClick={() => setFilters({ status: '', priority: '', category: '', agent: '' })}
              style={{ ...selectStyle, color: '#ef4444', borderColor: '#fecaca', background: '#fef2f2' }}>
              Clear Filters
            </button>
          )}
        </div>

        {/* Table */}
        {loading ? <p style={{ color: '#94a3b8' }}>Loading...</p> : (
          <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <div style={{
              display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr',
              padding: '12px 20px', background: '#f8fafc',
              borderBottom: '1px solid #e2e8f0', fontSize: '12px',
              fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px',
            }}>
              <span>Title</span><span>Category</span><span>Priority</span><span>Status</span>
              <span>Raised By</span><span>Assigned To</span>
            </div>
            {filtered.length === 0 && (
              <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>No tickets match filters.</div>
            )}
            {filtered.map((t, i) => (
              <div key={t.id}
                onClick={() => navigate(`/admin/tickets/${t.id}`)}
                style={{
                  display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr',
                  padding: '14px 20px', alignItems: 'center',
                  borderBottom: i < filtered.length - 1 ? '1px solid #f1f5f9' : 'none',
                  cursor: 'pointer', transition: 'background 0.1s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                onMouseLeave={e => e.currentTarget.style.background = '#fff'}
              >
                <span style={{ fontWeight: 600, fontSize: '14px', color: '#0f172a' }}>{t.title}</span>
                <span style={{ fontSize: '13px', color: '#64748b' }}>{t.category}</span>
                <PriorityBadge priority={t.priority} />
                <StatusBadge status={t.status} />
                <span style={{ fontSize: '13px', color: '#64748b' }}>{t.created_by.name}</span>
                <span style={{ fontSize: '13px', color: t.assigned_to ? '#64748b' : '#94a3b8' }}>
                  {t.assigned_to ? t.assigned_to.name : 'Unassigned'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}