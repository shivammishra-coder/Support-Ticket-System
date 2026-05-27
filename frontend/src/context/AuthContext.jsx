import { createContext, useContext, useState } from 'react'
import api from '../api/axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user')
    return stored ? JSON.parse(stored) : null
  })

  const [token, setToken] = useState(() => localStorage.getItem('token') || null)

  const login = async (email, password) => {
    // 1. Send clean JSON 
    const { data } = await api.post('/auth/login', {
      email: email,       
      password: password 
    })

    // 2. Persist the access token
    localStorage.setItem('token', data.access_token)
    setToken(data.access_token)

    const { data: profile } = await api.get('/auth/me', {
      headers: { Authorization: `Bearer ${data.access_token}` },
    })
    
    // 4. Persist user profile details globally
    localStorage.setItem('user', JSON.stringify(profile))
    setUser(profile)

    return profile
  }

  const logout = () => {
    // Wipe both hard cache and live state tracking fields clean
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}