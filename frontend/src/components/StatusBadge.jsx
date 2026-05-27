const STATUS_STYLES = {
  open:        { bg: '#e8f4fd', color: '#1a6fa8', label: 'Open' },
  in_progress: { bg: '#fff8e1', color: '#b36b00', label: 'In Progress' },
  resolved:    { bg: '#e8f5e9', color: '#2e7d32', label: 'Resolved' },
  closed:      { bg: '#f3f3f3', color: '#666',    label: 'Closed' },
}

const PRIORITY_STYLES = {
  high:   { bg: '#fdecea', color: '#c62828', label: 'High' },
  medium: { bg: '#fff3e0', color: '#e65100', label: 'Medium' },
  low:    { bg: '#f1f8e9', color: '#558b2f', label: 'Low' },
}

export function StatusBadge({ status }) {
  const s = STATUS_STYLES[status] || { bg: '#eee', color: '#333', label: status }
  return (
    <span style={{
      background: s.bg, color: s.color,
      padding: '3px 10px', borderRadius: '20px',
      fontSize: '12px', fontWeight: 600, letterSpacing: '0.3px',
    }}>
      {s.label}
    </span>
  )
}

export function PriorityBadge({ priority }) {
  const p = PRIORITY_STYLES[priority] || { bg: '#eee', color: '#333', label: priority }
  return (
    <span style={{
      background: p.bg, color: p.color,
      padding: '3px 10px', borderRadius: '20px',
      fontSize: '12px', fontWeight: 600, letterSpacing: '0.3px',
    }}>
      {p.label}
    </span>
  )
}