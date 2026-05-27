const STATUS_COLOR = {
  open: '#3b82f6',
  in_progress: '#f59e0b',
  resolved: '#22c55e',
  closed: '#94a3b8',
}

export default function HistoryTimeline({ history }) {
  if (!history || history.length === 0) {
    return <p style={{ color: '#94a3b8', fontSize: '14px' }}>No history yet.</p>
  }

  return (
    <div style={{ position: 'relative', paddingLeft: '24px' }}>
      {/* Vertical line */}
      <div style={{
        position: 'absolute', left: '7px', top: '8px',
        width: '2px', height: 'calc(100% - 16px)',
        background: '#e2e8f0',
      }} />

      {history.map((entry, i) => (
        <div key={entry.id} style={{ position: 'relative', marginBottom: i < history.length - 1 ? '20px' : 0 }}>
          {/* Dot */}
          <div style={{
            position: 'absolute', left: '-20px', top: '4px',
            width: '10px', height: '10px', borderRadius: '50%',
            background: STATUS_COLOR[entry.new_status] || '#94a3b8',
            border: '2px solid #fff',
            boxShadow: '0 0 0 2px #e2e8f0',
          }} />
          <div style={{ fontSize: '13px', color: '#475569' }}>
            <span style={{ fontWeight: 600, color: '#1e293b' }}>{entry.changed_by.name}</span>
            {' changed status from '}
            <span style={{ fontWeight: 600, textTransform: 'capitalize', color: STATUS_COLOR[entry.previous_status] }}>
              {entry.previous_status.replace('_', ' ')}
            </span>
            {' → '}
            <span style={{ fontWeight: 600, textTransform: 'capitalize', color: STATUS_COLOR[entry.new_status] }}>
              {entry.new_status.replace('_', ' ')}
            </span>
          </div>
          <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
            {new Date(entry.changed_at).toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  )
}