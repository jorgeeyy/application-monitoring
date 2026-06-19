import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { User, LoginCredentials, RegisterData } from '../types'
import { fetchCSRFToken, login as apiLogin, register as apiRegister, logout as apiLogout, fetchMe } from '../api/auth'

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function init() {
      try {
        await fetchCSRFToken()
        const me = await fetchMe()
        setUser(me)
      } catch {
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  const login = async (credentials: LoginCredentials) => {
    await fetchCSRFToken()
    const u = await apiLogin(credentials)
    setUser(u)
  }

  const register = async (data: RegisterData) => {
    await fetchCSRFToken()
    const u = await apiRegister(data)
    setUser(u)
  }

  const logout = async () => {
    await fetchCSRFToken()
    await apiLogout()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
