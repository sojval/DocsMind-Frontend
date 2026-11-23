import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import ErrorBanner from '../components/ErrorBanner'
import { LogoMark } from '../components/Icons'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const from = location.state?.from || '/'

  async function onSubmit(event) {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login({ username: username.trim(), password })
      navigate(from, {
        replace: true,
        state: { question: location.state?.question, documentId: location.state?.documentId, query: location.state?.query },
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell title="Sign in" subtitle="Access your documents, search, and Ask AI.">
      <form onSubmit={onSubmit} className="space-y-4">
        <ErrorBanner message={error} />
        <Field label="Username" value={username} onChange={setUsername} autoComplete="username" />
        <Field label="Password" type="password" value={password} onChange={setPassword} autoComplete="current-password" />
        <button
          type="submit"
          disabled={loading || !username.trim() || !password}
          className="w-full rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-violet-500 disabled:opacity-40"
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
        <p className="text-center text-sm text-zinc-500">
          New here?{' '}
          <Link to="/register" state={location.state} className="text-violet-300 hover:text-violet-200">
            Create an account
          </Link>
        </p>
      </form>
    </AuthShell>
  )
}

export function AuthShell({ title, subtitle, children }) {
  return (
    <div className="flex min-h-svh items-center justify-center bg-[#08080c] px-4 py-10 text-zinc-100">
      <div className="w-full max-w-md rounded-2xl border border-[#2a2a33] bg-[#111116] p-6">
        <div className="mb-6 flex items-center gap-2.5">
          <LogoMark />
          <div>
            <p className="text-sm font-semibold">DocsMind AI</p>
            <p className="text-[11px] text-zinc-500">Document intelligence</p>
          </div>
        </div>
        <h1 className="text-xl font-semibold text-white">{title}</h1>
        <p className="mt-1 mb-6 text-sm text-zinc-400">{subtitle}</p>
        {children}
      </div>
    </div>
  )
}

export function Field({ label, value, onChange, type = 'text', autoComplete }) {
  return (
    <label className="block text-sm">
      <span className="mb-1.5 block text-zinc-400">{label}</span>
      <input
        type={type}
        value={value}
        autoComplete={autoComplete}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-[#2a2a33] bg-[#0c0c11] px-3 py-2.5 outline-none focus:border-violet-500"
      />
    </label>
  )
}
