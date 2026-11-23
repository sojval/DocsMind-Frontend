const STYLES = {
  INDEXED: 'bg-emerald-500/15 text-emerald-300 ring-emerald-500/30',
  PROCESSING: 'bg-amber-500/15 text-amber-300 ring-amber-500/30',
  UPLOADING: 'bg-sky-500/15 text-sky-300 ring-sky-500/30',
  FAILED: 'bg-rose-500/15 text-rose-300 ring-rose-500/30',
}

export default function StatusBadge({ status }) {
  const label = status || 'UNKNOWN'
  const style = STYLES[label] || 'bg-zinc-500/15 text-zinc-300 ring-zinc-500/30'
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${style}`}>
      {label.charAt(0) + label.slice(1).toLowerCase()}
    </span>
  )
}
