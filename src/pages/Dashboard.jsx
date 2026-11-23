import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import ErrorBanner from '../components/ErrorBanner'
import { IconFile, IconSearch, IconSpark, IconUpload } from '../components/Icons'
import StatusBadge from '../components/StatusBadge'
import { useApp } from '../context/AppContext'
import { documentName, documentSize, documentStatus, formatBytes, formatDate } from '../utils/format'

export default function Dashboard() {
  const navigate = useNavigate()
  const { documents, documentsLoading, documentsError, refreshDocuments, lastResponseMs, assistantMessages, questionCount } = useApp()
  const [query, setQuery] = useState('')

  const stats = useMemo(() => {
    const storage = documents.reduce((sum, doc) => sum + Number(documentSize(doc) || 0), 0)
    return { count: documents.length, storage, latency: lastResponseMs, questions: questionCount }
  }, [documents, lastResponseMs, questionCount])

  const recent = documents.slice(0, 6)
  const latestAnswer = [...assistantMessages].reverse().find((item) => item.role === 'assistant')

  function submitAsk(event) {
    event.preventDefault()
    const next = query.trim()
    if (!next) return
    navigate('/ask', { state: { question: next } })
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <section className="text-center">
        <p className="mb-3 text-xs font-medium tracking-[0.2em] text-violet-300/80">DOCSMIND AI</p>
        <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-5xl">Ask your documents</h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm text-zinc-400 sm:text-base">
          Your files have the answers. Ask a question, explore the details, and get straight to what matters.
        </p>
        <form onSubmit={submitAsk} className="mx-auto mt-8 flex max-w-2xl overflow-hidden rounded-2xl border border-[#2a2a33] bg-[#111116] shadow-[0_0_0_1px_rgba(124,92,255,0.08)]">
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Ask anything about your uploaded files…" className="min-w-0 flex-1 bg-transparent px-5 py-4 text-sm text-zinc-100 outline-none placeholder:text-zinc-500" />
          <button type="submit" className="m-1.5 rounded-xl bg-violet-600 px-5 text-sm font-medium text-white hover:bg-violet-500">Search</button>
        </form>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <ActionCard to="/documents" icon={IconUpload} title="Upload" copy="Index PDF, DOCX, TXT, MD, and CSV files." />
        <ActionCard to="/ask" icon={IconSpark} title="Ask" copy="Get accurate answers to your questions." />
        <ActionCard to="/search" icon={IconSearch} title="Search" copy="Find the information you need by searching your documents by meaning, not just keywords." />
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Documents" value={stats.count} />
        <StatCard label="Questions asked" value={stats.questions} />
        <StatCard label="Last response Time" value={stats.latency != null ? `${(stats.latency / 1000).toFixed(2)} s` : '—'} />
        <StatCard label="Storage" value={`${formatBytes(stats.storage)} / 100 MB`}/>

      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.8fr)]">
        <div className="rounded-2xl border border-[#2a2a33] bg-[#111116]">
          <div className="flex items-center justify-between border-b border-[#2a2a33] px-5 py-4">
            <h2 className="text-sm font-semibold text-white">Recent documents</h2>
            <Link to="/documents" className="text-xs text-violet-300 hover:text-violet-200">View all</Link>
          </div>
          <div className="p-5">
            <ErrorBanner message={documentsError} onRetry={refreshDocuments} />
            {documentsLoading ? <p className="text-sm text-zinc-500">Loading documents…</p> : recent.length === 0 ? (
              <p className="text-sm text-zinc-500">No documents yet. Upload a file to get started.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] text-left text-sm">
                  <thead className="text-xs uppercase tracking-wide text-zinc-500"><tr><th className="pb-3 font-medium">Name</th><th className="pb-3 font-medium">Status</th><th className="pb-3 font-medium">Size</th><th className="pb-3 font-medium">Created</th></tr></thead>
                  <tbody className="divide-y divide-[#2a2a33]">
                    {recent.map((doc) => (
                      <tr key={doc.id}>
                        <td className="py-3"><div className="flex items-center gap-2"><IconFile className="h-4 w-4 text-violet-300" /><span className="font-medium text-zinc-100">{documentName(doc)}</span></div></td>
                        <td className="py-3"><StatusBadge status={documentStatus(doc)} /></td>
                        <td className="py-3 text-zinc-400">{formatBytes(documentSize(doc))}</td>
                        <td className="py-3 text-zinc-400">{formatDate(doc.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <aside className="rounded-2xl border border-[#2a2a33] bg-[#111116] p-5">
          <div className="mb-4 flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/15 text-violet-300"><IconSpark className="h-4 w-4" /></span>
            <div><h2 className="text-sm font-semibold text-white">AI Assistant</h2><p className="text-xs text-zinc-500">Latest question and answer</p></div>
          </div>
          {latestAnswer ? (
            <div className="space-y-4">
              {latestAnswer.question ? <div><p className="mb-1 text-xs font-medium uppercase tracking-wide text-zinc-500">Question</p><p className="text-sm text-zinc-200">{latestAnswer.question}</p></div> : null}
              <div><p className="mb-1 text-xs font-medium uppercase tracking-wide text-zinc-500">Answer</p><p className="text-sm leading-relaxed text-zinc-200">{latestAnswer.answer}</p></div>
            </div>
          ) : <p className="text-sm text-zinc-500">Ask a question to see it and its answer here.</p>}
        </aside>
      </section>
    </div>
  )
}

function ActionCard({ to, icon: Icon, title, copy }) {
  return <Link to={to} className="rounded-2xl border border-[#2a2a33] bg-[#111116] p-5 transition hover:border-violet-500/40 hover:bg-[#16161e]"><div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/15 text-violet-300"><Icon className="h-5 w-5" /></div><h3 className="text-sm font-semibold text-white">{title}</h3><p className="mt-1 text-sm text-zinc-500">{copy}</p></Link>
}

function StatCard({ label, value }) {
  return <div className="rounded-2xl border border-[#2a2a33] bg-[#111116] px-5 py-4"><p className="text-xs uppercase tracking-wide text-zinc-500">{label}</p><p className="mt-2 text-2xl font-semibold text-white">{value}</p></div>
}
