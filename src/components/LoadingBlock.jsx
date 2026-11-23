export default function LoadingBlock({ label = 'Loading…' }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-[#2a2a33] bg-[#16161c] px-4 py-6 text-sm text-zinc-400">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-violet-400 border-t-transparent" />
      {label}
    </div>
  )
}
