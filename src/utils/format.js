export function formatBytes(value) {
  const bytes = Number(value)
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  const size = bytes / 1024 ** index
  return `${size >= 10 || index === 0 ? size.toFixed(0) : size.toFixed(1)} ${units[index]}`
}

export function formatDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function formatScore(score) {
  if (score == null || Number.isNaN(Number(score))) return '—'
  return Number(score).toFixed(3)
}

export function documentName(doc) {
  return doc?.filename || doc?.fileName || 'Untitled'
}

export function documentSize(doc) {
  return doc?.filesize ?? doc?.fileSize ?? 0
}

export function documentStatus(doc) {
  return doc?.status || doc?.documentStatus || 'UNKNOWN'
}

export function documentChunks(doc) {
  return doc?.totalChunks ?? doc?.chunksCreated ?? 0
}

export const ACCEPTED_TYPES = '.pdf,.docx,.doc,.txt,.md,.csv'
