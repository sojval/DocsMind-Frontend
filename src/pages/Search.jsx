import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { searchSimilar } from '../api/chat'
import { IconFile } from '../components/Icons'
import DocumentSelect from '../components/DocumentSelect'
import ErrorBanner from '../components/ErrorBanner'
import LoadingBlock from '../components/LoadingBlock'
import { useApp } from '../context/AppContext'

export default function Search() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { documents, preferences } = useApp()
  const [query, setQuery] = useState('')
  const [documentId, setDocumentId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)
  const documentGroups = result ? groupMatches(result.matches) : []

  async function onSubmit(event) {
    event.preventDefault()
    const text = query.trim()
    if (!text) return
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/search', query: text } })
      return
    }
    setLoading(true)
    setError('')
    try {
      const payload = { query: text, topK: preferences.topK, similaritySearch: preferences.similarity }
      if (documentId) payload.documentId = Number(documentId)
      setResult(await searchSimilar(payload))
    } catch (err) {
      setError(err.message)
      setResult(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Search</h1>
        <p className="mt-1 text-sm text-zinc-400">Search by keyword or meaning to preview the documents most relevant to your query.</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-3 rounded-2xl border border-[#2a2a33] bg-[#111116] p-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by keyword or meaning…" className="min-w-0 flex-1 rounded-xl border border-[#2a2a33] bg-[#0c0c11] px-4 py-3 text-sm outline-none focus:border-violet-500" />
          <DocumentSelect documents={documents} value={documentId} onChange={setDocumentId} className="sm:w-64" />
          <button type="submit" disabled={loading || !query.trim()} className="rounded-xl bg-violet-600 px-5 py-3 text-sm font-medium text-white hover:bg-violet-500 disabled:opacity-40">Search</button>
        </div>
      </form>

      <ErrorBanner message={error} />
      {loading ? <LoadingBlock label="Searching…" /> : null}

      {result ? (
        <section className="space-y-4">
          <h2 className="text-sm font-semibold text-white">{documentGroups.length} document{documentGroups.length === 1 ? '' : 's'} found for “{result.query}”</h2>
          {documentGroups.length ? (
            <ul className="space-y-3">
              {documentGroups.map((group) => (
                <li key={group.key} className="overflow-hidden rounded-xl border border-[#2a2a33] bg-[#111116]">
                  <div className="flex items-center gap-3 border-b border-[#2a2a33] px-4 py-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-violet-500/20 bg-violet-500/10 text-violet-300"><IconFile className="h-4 w-4" /></span>
                    <div className="min-w-0"><p className="truncate text-sm font-medium text-zinc-100">{group.fileName}</p><p className="mt-0.5 text-xs text-zinc-500">Document preview · {group.matches.length} relevant passage{group.matches.length === 1 ? '' : 's'}</p></div>
                  </div>
                  <div className="space-y-3 p-4">
                    {group.matches.slice(0, 3).map((match, index) => (
                      <div key={`${match.pageNumber ?? 'page'}-${index}`} className="rounded-lg bg-[#0c0c11] p-3">
                        {match.pageNumber != null ? <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-zinc-500">Page {match.pageNumber}</p> : null}
                        <p className="line-clamp-5 whitespace-pre-wrap text-sm leading-relaxed text-zinc-300"><HighlightMatches text={match.support || 'No preview text available.'} query={result.query} /></p>
                      </div>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          ) : <p className="rounded-xl border border-[#2a2a33] bg-[#111116] p-4 text-sm text-zinc-500">No relevant documents found.</p>}
        </section>
      ) : null}
    </div>
  )
}

function groupMatches(matches = []) {
  const groups = new Map()
  matches.forEach((match) => {
    const fileName = match.fileName || 'Untitled document'
    const key = match.documentId ?? fileName
    if (!groups.has(key)) groups.set(key, { key, fileName, matches: [] })
    groups.get(key).matches.push(match)
  })
  return [...groups.values()]
}

function HighlightMatches({ text, query }) {
  const terms = [...new Set((query || '').trim().split(/\s+/).filter((term) => term.length > 1))]
  if (!terms.length || !text) return text
  const escaped = terms.sort((a, b) => b.length - a.length).map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  const pattern = new RegExp(`(${escaped.join('|')})`, 'gi')
  return String(text).split(pattern).map((part, index) =>
    terms.some((term) => part.toLowerCase() === term.toLowerCase())
      ? <mark key={`${part}-${index}`} className="rounded-sm bg-amber-300/25 px-0.5 text-amber-100">{part}</mark>
      : part,
  )
}
