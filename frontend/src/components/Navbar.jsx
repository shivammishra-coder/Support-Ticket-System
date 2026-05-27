import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const NAV_LINKS = {
  employee:      [{ to: '/my-tickets', label: 'My Tickets' }],
  support_agent: [{ to: '/agent/queue', label: 'Queue' }, { to: '/dashboard/agent', label: 'Dashboard' }],
  admin:         [{ to: '/admin/tickets', label: 'All Tickets' }, { to: '/dashboard/admin', label: 'Dashboard' }],
}

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const links = NAV_LINKS[user?.role] || []

  return (
    <nav style={{
      background: '#0f172a', color: '#fff',
      padding: '0 24px', height: '56px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      position: 'sticky', top: 0, zIndex: 100,
      boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
        <Link to="/" style={{ color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: '16px', letterSpacing: '-0.3px' }}>
          🎫 HelpDesk
        </Link>
        <div style={{ display: 'flex', gap: '24px' }}>
          {links.map(link => (
            <Link key={link.to} to={link.to} style={{
              color: '#94a3b8', textDecoration: 'none', fontSize: '14px', fontWeight: 500,
              transition: 'color 0.15s',
            }}
              onMouseEnter={e => e.target.style.color = '#fff'}
              onMouseLeave={e => e.target.style.color = '#94a3b8'}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <span style={{ fontSize: '13px', color: '#94a3b8' }}>
          {user?.name} · <span style={{
            textTransform: 'capitalize',
            color: '#60a5fa',
          }}>{user?.role?.replace('_', ' ')}</span>
        </span>
        <button onClick={handleLogout} style={{
          background: 'transparent', border: '1px solid #334155',
          color: '#94a3b8', padding: '6px 14px', borderRadius: '6px',
          fontSize: '13px', cursor: 'pointer', transition: 'all 0.15s',
        }}
          onMouseEnter={e => { e.target.style.borderColor = '#fff'; e.target.style.color = '#fff' }}
          onMouseLeave={e => { e.target.style.borderColor = '#334155'; e.target.style.color = '#94a3b8' }}
        >
          Logout
        </button>
      </div>
    </nav>
  )
}