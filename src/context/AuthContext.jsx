import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { login as loginRequest, register as registerRequest } from '../api/auth'
import { clearSession, getStoredToken, getStoredUser } from '../api/session'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => getStoredToken())
  const [user, setUser] = useState(() => getStoredUser())

  const applySession = useCallback((session) => {
    setToken(session?.accessToken || '')
    setUser(session?.user || null)
  }, [])

  const login = useCallback(async (credentials) => {
    const session = await loginRequest(credentials)
    applySession(session)
    return session
  }, [applySession])

  const register = useCallback(async (payload) => {
    const session = await registerRequest(payload)
    applySession(session)
    return session
  }, [applySession])

  const logout = useCallback(() => {
    clearSession()
    setToken('')
    setUser(null)
  }, [])

  useEffect(() => {
    const onUnauthorized = () => logout()
    window.addEventListener('docsmind:unauthorized', onUnauthorized)
    return () => window.removeEventListener('docsmind:unauthorized', onUnauthorized)
  }, [logout])

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token),
      login,
      register,
      logout,
    }),
    [token, user, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
