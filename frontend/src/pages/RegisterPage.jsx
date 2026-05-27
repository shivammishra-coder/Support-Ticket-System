import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import Navbar from '../components/Navbar'

const ROLES = [
  { value: 'employee', label: 'Employee', desc: 'Can raise and track their own tickets' },
  { value: 'support_agent', label: 'Support Agent', desc: 'Can handle and resolve tickets' },
]

export default function RegisterPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', role: 'employee' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    try {
      const { data } = await api.post('/auth/register', {
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
      })
      setSuccess(`Account created for ${data.name} (${data.role.replace('_', ' ')}) successfully!`)
      setForm({ name: '', email: '', password: '', confirmPassword: '', role: 'employee' })
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create account.')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%', padding: '9px 12px', borderRadius: '8px',
    border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none',
    boxSizing: 'border-box', fontFamily: 'inherit', background: '#fff',
  }

  const labelStyle = {
    display: 'block', color: '#475569',
    fontSize: '13px', fontWeight: 500, marginBottom: '6px',
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: "'DM Sans', sans-serif" }}>
      <Navbar />
      <div style={{ maxWidth: '560px', margin: '40px auto', padding: '0 24px' }}>

        {/* Back */}
        <button onClick={() => navigate('/admin/tickets')} style={{
          background: 'none', border: 'none', color: '#64748b', fontSize: '13px',
          cursor: 'pointer', padding: '0 0 16px', display: 'flex', alignItems: 'center', gap: '4px',
        }}>
          ← Back to All Tickets
        </button>

        <div style={{
          background: '#fff', borderRadius: '16px', padding: '36px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0',
        }}>
          <div style={{ marginBottom: '28px' }}>
            <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', margin: '0 0 6px' }}>
              Create New Account
            </h1>
            <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
              Admin only — create employee or support agent accounts.
            </p>
          </div>

          {/* Role selector */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '24px' }}>
            {ROLES.map(r => (
              <div
                key={r.value}
                onClick={() => setForm({ ...form, role: r.value })}
                style={{
                  border: `2px solid ${form.role === r.value ? '#3b82f6' : '#e2e8f0'}`,
                  borderRadius: '10px', padding: '14px',
                  cursor: 'pointer', transition: 'border-color 0.15s',
                  background: form.role === r.value ? '#eff6ff' : '#fff',
                }}
              >
                <div style={{ fontWeight: 600, fontSize: '14px', color: form.role === r.value ? '#1d4ed8' : '#0f172a', marginBottom: '4px' }}>
                  {form.role === r.value ? '✓ ' : ''}{r.label}
                </div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>{r.desc}</div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Full Name</label>
              <input type="text" value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="John Doe" required style={inputStyle} />
            </div>

            <div>
              <label style={labelStyle}>Email Address</label>
              <input type="email" value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="john@company.com" required style={inputStyle} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={labelStyle}>Password</label>
                <input type="password" value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="Min. 6 characters" required style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Confirm Password</label>
                <input type="password" value={form.confirmPassword}
                  onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                  placeholder="Re-enter password" required style={inputStyle} />
              </div>
            </div>

            {error && (
              <div style={{
                background: '#fef2f2', border: '1px solid #fecaca',
                color: '#b91c1c', padding: '10px 14px', borderRadius: '8px', fontSize: '13px',
              }}>
                ❌ {error}
              </div>
            )}

            {success && (
              <div style={{
                background: '#f0fdf4', border: '1px solid #bbf7d0',
                color: '#15803d', padding: '10px 14px', borderRadius: '8px', fontSize: '13px',
              }}>
                ✅ {success}
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
              <button type="submit" disabled={loading} style={{
                flex: 1, background: '#0f172a', color: '#fff', border: 'none',
                padding: '11px', borderRadius: '8px', fontSize: '14px',
                fontWeight: 600, cursor: 'pointer', opacity: loading ? 0.7 : 1,
              }}>
                {loading ? 'Creating...' : `Create ${form.role === 'support_agent' ? 'Agent' : 'Employee'} Account`}
              </button>
              <button type="button" onClick={() => navigate('/admin/tickets')} style={{
                background: '#f1f5f9', color: '#475569', border: 'none',
                padding: '11px 20px', borderRadius: '8px', fontSize: '14px', cursor: 'pointer',
              }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}