import { createContext, useContext, useState, useCallback } from 'react'
import api from '../api/axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('ra_user')
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })

  const login = useCallback(async (username, password) => {
    const form = new URLSearchParams()
    form.append('username', username)
    form.append('password', password)

    const { data } = await api.post('/auth/login', form, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })

    const userData = { username: data.username, rol: data.rol }
    localStorage.setItem('ra_token', data.access_token)
    localStorage.setItem('ra_user', JSON.stringify(userData))
    setUser(userData)
    return userData
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('ra_token')
    localStorage.removeItem('ra_user')
    setUser(null)
  }, [])

  const isEncargado = user?.rol === 'encargado' || user?.rol === 'dueño'
  const isDueno     = user?.rol === 'dueño'

  return (
    <AuthContext.Provider value={{ user, login, logout, isEncargado, isDueno }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}
