import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { StatusBadge, PriorityBadge } from './StatusBadge'


export default function TicketTable({
  tickets = [],
  loading = false,
  linkPrefix = '/tickets',
  showAssigned = true,
  showAuthor = false,
  extraActions = null,
}) {
  const navigate = useNavigate()

  const [filters, setFilters] = useState({
    id: '', title: '', category: '', priority: '',
    status: '', assigned: '', author: '', dateFrom: '', dateTo: '',
  })

  const [filtered, setFiltered] = useState([])

  // Sort by id asc then apply filters
  useEffect(() => {
    let result = [...tickets].sort((a, b) => a.id - b.id)

    if (filters.id)
      result = result.filter(t => String(t.id).includes(filters.id.replace('#', '')))
    if (filters.title)
      result = result.filter(t => t.title.toLowerCase().includes(filters.title.toLowerCase()))
    if (filters.category)
      result = result.filter(t => t.category === filters.category)
    if (filters.priority)
      result = result.filter(t => t.priority === filters.priority)
    if (filters.status)
      result = result.filter(t => t.status === filters.status)
    if (filters.assigned)
      result = result.filter(t => t.assigned_to?.name.toLowerCase().includes(filters.assigned.toLowerCase()))
    if (filters.author)
      result = result.filter(t => t.created_by?.name.toLowerCase().includes(filters.author.toLowerCase()))
    if (filters.dateFrom)
      result = result.filter(t => new Date(t.created_at) >= new Date(filters.dateFrom))
    if (filters.dateTo)
      result = result.filter(t => new Date(t.created_at) <= new Date(filters.dateTo + 'T23:59:59'))

    setFiltered(result)
  }, [filters, tickets])

  const set = (key, val) => setFilters(f => ({ ...f, [key]: val }))

  const clearAll = () => setFilters({
    id: '', title: '', category: '', priority: '',
    status: '', assigned: '', author: '', dateFrom: '', dateTo: '',
  })

  const hasFilters = Object.values(filters).some(Boolean)

  // Shared styles
  const filterInput = {
    width: '100%', padding: '5px 8px', fontSize: '12px',
    border: '1px solid #e2e8f0', borderRadius: '5px',
    outline: 'none', background: '#fafafa', fontFamily: 'inherit',
    boxSizing: 'border-box',
  }
  const filterSelect = { ...filterInput, cursor: 'pointer' }

  // Build grid template
  const cols = [
    '70px',                    // #ID
    '1.8fr',                   // Title
    '100px',                   // Category
    '100px',                   // Priority
    '120px',                   // Status
    showAuthor   ? '130px' : null,  // Raised By
    showAssigned ? '130px' : null,  // Assigned To
    '110px',                   // Date
    extraActions ? '90px' : null,   // Action
  ].filter(Boolean).join(' ')

  const headers = [
    { key: 'id',       label: '#ID',        type: 'text' },
    { key: 'title',    label: 'Title',       type: 'text' },
    { key: 'category', label: 'Category',    type: 'select', options: ['IT', 'HR', 'Facilities', 'Other'] },
    { key: 'priority', label: 'Priority',    type: 'select', options: ['high', 'medium', 'low'] },
    { key: 'status',   label: 'Status',      type: 'select', options: ['open', 'in_progress', 'resolved', 'closed'] },
    showAuthor   ? { key: 'author',   label: 'Raised By',   type: 'text' } : null,
    showAssigned ? { key: 'assigned', label: 'Assigned To', type: 'text' } : null,
    { key: 'date',     label: 'Date',        type: 'date' },
    extraActions ? { key: '_action', label: 'Action', type: 'none' } : null,
  ].filter(Boolean)

  if (loading) return <p style={{ color: '#94a3b8', padding: '20px 0' }}>Loading...</p>

  return (
    <div>
      {/* Filter summary bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <span style={{ fontSize: '13px', color: '#64748b' }}>
          Showing <strong style={{ color: '#0f172a' }}>{filtered.length}</strong> of <strong style={{ color: '#0f172a' }}>{tickets.length}</strong> tickets
        </span>
        {hasFilters && (
          <button onClick={clearAll} style={{
            background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca',
            padding: '5px 14px', borderRadius: '6px', fontSize: '12px',
            fontWeight: 600, cursor: 'pointer',
          }}>
            ✕ Clear All Filters
          </button>
        )}
      </div>

      <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'auto' }}>

        {/* ── Column header labels ── */}
        <div style={{
          display: 'grid', gridTemplateColumns: cols,
          padding: '12px 16px', background: '#0f172a',
          borderBottom: '1px solid #1e293b',
          fontSize: '11px', fontWeight: 700,
          color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.6px',
          borderRadius: '12px 12px 0 0',
        }}>
          {headers.map(h => (
            <span key={h.key}>{h.label}</span>
          ))}
        </div>

        {/* ── Filter inputs row ── */}
        <div style={{
          display: 'grid', gridTemplateColumns: cols,
          padding: '8px 16px', background: '#f8fafc',
          borderBottom: '2px solid #e2e8f0', gap: '6px', alignItems: 'center',
        }}>
          {headers.map(h => {
            if (h.type === 'none') return <div key={h.key} />

            if (h.type === 'select') return (
              <select key={h.key} value={filters[h.key] || ''} onChange={e => set(h.key, e.target.value)} style={filterSelect}>
                <option value="">All</option>
                {h.options.map(o => (
                  <option key={o} value={o}>
                    {o.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                  </option>
                ))}
              </select>
            )

            if (h.type === 'date') return (
              <div key={h.key} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                <span>from:</span>
                <input type="date" value={filters.dateFrom} onChange={e => set('dateFrom', e.target.value)}
                  style={filterInput} title="From date" />
                  <span>to:</span>
                <input type="date" value={filters.dateTo} onChange={e => set('dateTo', e.target.value)}
                  style={filterInput} title="To date" />
              </div>
            )

            return (
              <input key={h.key} type="text" value={filters[h.key] || ''}
                onChange={e => set(h.key, e.target.value)}
                placeholder={`Filter...`} style={filterInput} />
            )
          })}
        </div>

        {/* ── Data rows ── */}
        {filtered.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#94a3b8' }}>
            <div style={{ fontSize: '32px', marginBottom: '10px' }}>🔍</div>
            <p style={{ margin: 0 }}>No tickets match the current filters.</p>
          </div>
        ) : (
          filtered.map((t, i) => (
            <div key={t.id}
              onClick={() => navigate(`${linkPrefix}/${t.id}`)}
              style={{
                display: 'grid', gridTemplateColumns: cols,
                padding: '13px 16px', alignItems: 'center',
                borderBottom: i < filtered.length - 1 ? '1px solid #f1f5f9' : 'none',
                cursor: 'pointer', transition: 'background 0.1s', gap: '6px',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
              onMouseLeave={e => e.currentTarget.style.background = '#fff'}
            >
              {/* #ID */}
              <span style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 700 }}>{t.id}</span>

              {/* Title */}
              <span style={{
                fontWeight: 600, fontSize: '13px', color: '#0f172a',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>{t.title}</span>

              {/* Category */}
              <span style={{ fontSize: '12px', color: '#64748b' }}>{t.category}</span>

              {/* Priority */}
              <PriorityBadge priority={t.priority} />

              {/* Status */}
              <StatusBadge status={t.status} />

              {/* Raised By */}
              {showAuthor && (
                <span style={{ fontSize: '12px', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {t.created_by?.name}
                </span>
              )}

              {/* Assigned To */}
              {showAssigned && (
                <span style={{ fontSize: '12px', color: t.assigned_to ? '#64748b' : '#cbd5e1', fontStyle: t.assigned_to ? 'normal' : 'italic' }}>
                  {t.assigned_to ? t.assigned_to.name : 'Unassigned'}
                </span>
              )}

              {/* Date */}
              <span style={{ fontSize: '12px', color: '#64748b' }}>
                {new Date(t.created_at).toLocaleDateString()}
              </span>

              {/* Extra action (e.g. Assign Me button) */}
              {extraActions && (
                <div onClick={e => e.stopPropagation()}>
                  {extraActions(t)}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}