import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import Navbar from '../components/Navbar'

const STATUS_COLORS = {
  open: { bg: '#e8f4fd', color: '#1a6fa8', icon: '🔵' },
  in_progress: { bg: '#fff8e1', color: '#b36b00', icon: '🟡' },
  resolved: { bg: '#e8f5e9', color: '#2e7d32', icon: '🟢' },
  closed: { bg: '#f3f3f3', color: '#666', icon: '⚫' },
}
const PRIORITY_COLORS = {
  high: { bg: '#fdecea', color: '#c62828', icon: '🔴' },
  medium: { bg: '#fff3e0', color: '#e65100', icon: '🟠' },
  low: { bg: '#f1f8e9', color: '#558b2f', icon: '🟢' },
}

function StatCard({ label, value, bg, color, icon }) {
  return (
    <div style={{
      background: bg, borderRadius: '12px', padding: '20px 24px',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    }}>
      <div>
        <p style={{ margin: '0 0 4px', fontSize: '13px', color, fontWeight: 600, textTransform: 'capitalize' }}>
          {label.replace('_', ' ')}
        </p>
        <p style={{ margin: 0, fontSize: '32px', fontWeight: 700, color }}>{value}</p>
      </div>
      <span style={{ fontSize: '28px' }}>{icon}</span>
    </div>
  )
}

export default function AdminDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/dashboard/admin').then(r => setData(r.data)).catch(console.error).finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'sans-serif' }}>
      <Navbar />
      <p style={{ padding: '40px', color: '#94a3b8' }}>Loading...</p>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: "'DM Sans', sans-serif" }}>
      <Navbar />
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 24px' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#0f172a', margin: 0 }}>Admin Dashboard</h1>
            <p style={{ color: '#64748b', fontSize: '14px', margin: '4px 0 0' }}>
              Total tickets: <strong style={{ color: '#0f172a' }}>{data?.total}</strong>
            </p>
          </div>
          <button onClick={() => navigate('/admin/tickets')} style={{
            background: '#0f172a', color: '#fff', border: 'none',
            padding: '10px 20px', borderRadius: '8px', fontSize: '14px',
            fontWeight: 600, cursor: 'pointer',
          }}>
            View All Tickets →
          </button>
        </div>

        {/* By Status */}
        <h2 style={{ fontSize: '15px', fontWeight: 600, color: '#475569', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          By Status
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '28px' }}>
          {data && Object.entries(data.by_status).map(([status, count]) => (
            <StatCard
              key={status} label={status} value={count}
              bg={STATUS_COLORS[status]?.bg} color={STATUS_COLORS[status]?.color}
              icon={STATUS_COLORS[status]?.icon}
            />
          ))}
        </div>

        {/* By Priority */}
        <h2 style={{ fontSize: '15px', fontWeight: 600, color: '#475569', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          By Priority
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
          {data && Object.entries(data.by_priority).map(([priority, count]) => (
            <StatCard
              key={priority} label={priority} value={count}
              bg={PRIORITY_COLORS[priority]?.bg} color={PRIORITY_COLORS[priority]?.color}
              icon={PRIORITY_COLORS[priority]?.icon}
            />
          ))}
        </div>
      </div>
    </div>
  )
}