export default function ErrorBanner({ message, onRetry }) {
  if (!message) return null
  return (
    <div className="flex items-start justify-between gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
      <p>{message}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="shrink-0 rounded-lg bg-rose-500/20 px-2.5 py-1 text-xs font-medium hover:bg-rose-500/30"
        >
          Retry
        </button>
      ) : null}
    </div>
  )
}
