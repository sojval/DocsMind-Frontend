const TOKEN_KEY = 'docsmind.token'
const USER_KEY = 'docsmind.user'

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY) || ''
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function persistSession(session) {
  if (session?.accessToken) localStorage.setItem(TOKEN_KEY, session.accessToken)
  if (session?.user) localStorage.setItem(USER_KEY, JSON.stringify(session.user))
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}
