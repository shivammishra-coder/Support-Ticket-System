import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const profile = await login(email, password)
      if (profile.role === 'admin') navigate('/admin/tickets')
      else if (profile.role === 'support_agent') navigate('/agent/queue')
      else navigate('/my-tickets')
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#0f172a',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <div style={{
        background: '#1e293b', borderRadius: '16px',
        padding: '48px', width: '100%', maxWidth: '420px',
        boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
      }}>
        <div style={{ marginBottom: '32px' }}>
          
          <h1 style={{ color: '#f1f5f9', fontSize: '24px', fontWeight: 700, margin: '0 0 6px' }}>
            HelpDesk
          </h1>
          <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
            Sign in to your account
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', color: '#94a3b8', fontSize: '13px', fontWeight: 500, marginBottom: '6px' }}>
              Email
            </label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@company.com" required
              style={{
                width: '100%', padding: '10px 14px', borderRadius: '8px',
                background: '#0f172a', border: '1px solid #334155',
                color: '#f1f5f9', fontSize: '14px', outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', color: '#94a3b8', fontSize: '13px', fontWeight: 500, marginBottom: '6px' }}>
              Password
            </label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••" required
              style={{
                width: '100%', padding: '10px 14px', borderRadius: '8px',
                background: '#0f172a', border: '1px solid #334155',
                color: '#f1f5f9', fontSize: '14px', outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>

          {error && (
            <div style={{
              background: '#450a0a', border: '1px solid #991b1b',
              color: '#fca5a5', padding: '10px 14px', borderRadius: '8px', fontSize: '13px',
            }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} style={{
            background: '#3b82f6', color: '#fff', border: 'none',
            padding: '12px', borderRadius: '8px', fontSize: '15px',
            fontWeight: 600, cursor: 'pointer', marginTop: '8px',
            opacity: loading ? 0.7 : 1,
          }}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

       
      </div>
    </div>
  )
}