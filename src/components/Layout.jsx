import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { IconFile, IconGrid, IconMenu, IconSearch, IconSettings, IconSpark, LogoMark } from './Icons'

const NAV = [
  { to: '/', label: 'Dashboard', icon: IconGrid, end: true },
  { to: '/documents', label: 'Documents', icon: IconFile },
  { to: '/ask', label: 'Ask AI', icon: IconSpark },
  { to: '/search', label: 'Search', icon: IconSearch },
  { to: '/settings', label: 'Settings', icon: IconSettings },
]

function NavItems({ onNavigate }) {
  return NAV.map(({ to, label, icon: Icon, end }) => (
    <NavLink key={to} to={to} end={end} onClick={onNavigate} className={({ isActive }) =>
      `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${isActive ? 'bg-violet-500/15 text-white ring-1 ring-violet-500/40' : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-100'}`
    }>
      <Icon className="h-4 w-4" />{label}
    </NavLink>
  ))
}

export default function Layout() {
  const [open, setOpen] = useState(false)
  const { user, logout } = useAuth()
  return (
    <div className="min-h-svh bg-[#08080c] text-zinc-100">
      <div className="flex min-h-svh">
        <aside className="hidden w-60 shrink-0 border-r border-[#1f1f27] bg-[#0c0c11] p-4 lg:flex lg:flex-col">
          <Brand />
          <nav className="flex flex-1 flex-col gap-1"><NavItems />{!user ? <AuthNavItems /> : null}</nav>
          <UserPanel user={user} onLogout={logout} />
        </aside>
        {open ? <div className="fixed inset-0 z-40 lg:hidden">
          <button type="button" className="absolute inset-0 bg-black/60" aria-label="Close menu" onClick={() => setOpen(false)} />
          <aside className="relative h-full w-64 border-r border-[#1f1f27] bg-[#0c0c11] p-4">
            <Brand /><nav className="flex flex-col gap-1"><NavItems onNavigate={() => setOpen(false)} />{!user ? <AuthNavItems onNavigate={() => setOpen(false)} /> : null}</nav>
            <div className="mt-6"><UserPanel user={user} onLogout={logout} /></div>
          </aside>
        </div> : null}
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex items-center gap-3 border-b border-[#1f1f27] px-4 py-3 lg:hidden">
            <button type="button" onClick={() => setOpen(true)} className="rounded-lg border border-[#2a2a33] p-2 text-zinc-300" aria-label="Open menu"><IconMenu className="h-5 w-5" /></button>
            <span className="text-sm font-semibold">DocsMind AI</span>
            {user ? <span className="ml-auto truncate text-xs text-zinc-500">{user.username}</span> : <div className="ml-auto flex items-center gap-3 text-xs"><NavLink to="/login" className="text-zinc-300 hover:text-white">Sign in</NavLink><NavLink to="/register" className="rounded-lg bg-violet-600 px-3 py-2 text-white hover:bg-violet-500">Register</NavLink></div>}
          </header>
          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8"><Outlet /></main>
        </div>
      </div>
    </div>
  )
}

function Brand() {
  return <div className="mb-8 flex items-center gap-2.5 px-1"><LogoMark /><div><p className="text-sm font-semibold tracking-tight">DocsMind AI</p><p className="text-[11px] text-zinc-500">Document intelligence</p></div></div>
}

function AuthNavItems({ onNavigate }) {
  return <div className="mt-3 flex flex-col gap-1 border-t border-[#1f1f27] pt-3"><NavLink to="/login" onClick={onNavigate} className="rounded-xl px-3 py-2.5 text-sm text-zinc-300 hover:bg-white/5 hover:text-white">Sign in</NavLink><NavLink to="/register" onClick={onNavigate} className="rounded-xl bg-violet-600 px-3 py-2.5 text-center text-sm text-white hover:bg-violet-500">Register</NavLink></div>
}

function UserPanel({ user, onLogout }) {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) return <div className="mt-auto rounded-xl border border-[#2a2a33] p-3"><div className="mb-3 flex items-center gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#3b3b47] bg-[#1c1c24] text-zinc-400"><UserAvatarIcon /></span><p className="text-sm font-medium text-zinc-100">Sign in to get started</p></div><div className="flex gap-2"><NavLink to="/login" className="flex-1 rounded-lg bg-violet-600 px-3 py-2 text-center text-xs text-white">Sign in</NavLink><NavLink to="/register" className="flex-1 rounded-lg border border-[#2a2a33] px-3 py-2 text-center text-xs text-zinc-300">Register</NavLink></div></div>
  const displayName = user?.username || user?.email || 'Signed in'
  const avatarUrl = user?.avatarUrl || user?.profileImage || user?.imageUrl
  return <div className="mt-auto rounded-xl border border-[#2a2a33] p-3"><div className="flex min-w-0 items-center gap-3"><span className="h-10 w-10 shrink-0 overflow-hidden rounded-full border border-[#3b3b47] bg-[#1c1c24]">{avatarUrl ? <img src={avatarUrl} alt={`${displayName} profile`} className="h-full w-full object-cover" /> : <span className="flex h-full w-full items-center justify-center text-sm font-semibold text-violet-200">{displayName.slice(0, 1).toUpperCase()}</span>}</span><div className="min-w-0"><p className="truncate text-sm font-medium text-zinc-100" title={displayName}>{displayName}</p><p className="truncate text-xs text-zinc-500" title={user?.email || ''}>{user?.email}</p></div></div><button type="button" onClick={onLogout} className="mt-3 w-full rounded-lg border border-[#2a2a33] px-3 py-1.5 text-xs text-zinc-300 hover:bg-white/5">Sign out</button></div>
}

function UserAvatarIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-5 w-5" aria-hidden="true"><circle cx="12" cy="8" r="3.5" /><path d="M5 20a7 7 0 0 1 14 0" /></svg>
}
