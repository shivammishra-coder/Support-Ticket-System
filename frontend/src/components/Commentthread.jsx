import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'

export default function CommentThread({ ticketId, comments, onCommentAdded }) {
  const { user } = useAuth()
  const [body, setBody] = useState('')
  const [isInternal, setIsInternal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const isAgentOrAdmin = user?.role === 'support_agent' || user?.role === 'admin'

  // Employees only see public comments
  const visibleComments = isAgentOrAdmin
    ? comments
    : comments.filter(c => !c.is_internal)

  const handleSubmit = async () => {
    if (!body.trim()) return
    setLoading(true)
    setError('')
    try {
      await api.post(`/tickets/${ticketId}/comments`, {
        body,
        is_internal: isAgentOrAdmin ? isInternal : false,
      })
      setBody('')
      setIsInternal(false)
      onCommentAdded()
    } catch (e) {
      setError(e.response?.data?.detail || 'Failed to post comment')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px', color: '#1e293b' }}>
        Comments {visibleComments.length > 0 && `(${visibleComments.length})`}
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
        {visibleComments.length === 0 && (
          <p style={{ color: '#94a3b8', fontSize: '14px' }}>No comments yet.</p>
        )}
        {visibleComments.map(c => (
          <div key={c.id} style={{
            background: c.is_internal ? '#fffbeb' : '#f8fafc',
            border: `1px solid ${c.is_internal ? '#fde68a' : '#e2e8f0'}`,
            borderRadius: '8px', padding: '12px 16px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontWeight: 600, fontSize: '13px', color: '#334155' }}>
                {c.author.name}
                {c.is_internal && (
                  <span style={{ marginLeft: '8px', fontSize: '11px', color: '#b45309', background: '#fef3c7', padding: '2px 8px', borderRadius: '10px' }}>
                    Internal Note
                  </span>
                )}
              </span>
              <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                {new Date(c.created_at).toLocaleString()}
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '14px', color: '#475569', lineHeight: '1.5' }}>{c.body}</p>
          </div>
        ))}
      </div>

      {/* Add comment form */}
      <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
        <textarea
          value={body}
          onChange={e => setBody(e.target.value)}
          placeholder="Write a comment..."
          rows={3}
          style={{
            width: '100%', padding: '10px 12px', borderRadius: '8px',
            border: '1px solid #e2e8f0', fontSize: '14px', resize: 'vertical',
            fontFamily: 'inherit', boxSizing: 'border-box', outline: 'none',
          }}
        />
        {error && <p style={{ color: '#ef4444', fontSize: '13px', margin: '4px 0' }}>{error}</p>}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
          {isAgentOrAdmin && (
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#64748b', cursor: 'pointer' }}>
              <input type="checkbox" checked={isInternal} onChange={e => setIsInternal(e.target.checked)} />
              Internal note (hidden from requester)
            </label>
          )}
          {!isAgentOrAdmin && <span />}
          <button onClick={handleSubmit} disabled={loading || !body.trim()} style={{
            background: '#0f172a', color: '#fff', border: 'none',
            padding: '8px 20px', borderRadius: '6px', fontSize: '13px',
            fontWeight: 500, cursor: 'pointer', opacity: loading || !body.trim() ? 0.5 : 1,
          }}>
            {loading ? 'Posting...' : 'Post Comment'}
          </button>
        </div>
      </div>
    </div>
  )
}