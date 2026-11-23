import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import { askQuestion } from '../api/chat'
import CitationList from '../components/CitationList'
import DocumentSelect from '../components/DocumentSelect'
import ErrorBanner from '../components/ErrorBanner'
import { IconSend, IconSpark } from '../components/Icons'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'

export default function Ask() {
  const location = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const {
    documents,
    preferences,
    conversationId,
    setConversationId,
    setLastResponseMs,
    assistantMessages,
    setAssistantMessages,
    incrementQuestionCount,
  } = useApp()
  const [question, setQuestion] = useState(location.state?.question || '')
  const [documentId, setDocumentId] = useState(location.state?.documentId || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const endRef = useRef(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [assistantMessages, loading])

  async function onSubmit(event) {
    event.preventDefault()
    const text = question.trim()
    if (!text || loading) return
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/ask', question: text, documentId } })
      return
    }

    setError('')
    setLoading(true)
    incrementQuestionCount()
    setAssistantMessages((current) => [...current, { role: 'user', content: text }])
    setQuestion('')

    try {
      const payload = {
        question: text,
        topK: preferences.topK,
        similarity: preferences.similarity,
      }
      if (documentId) payload.documentId = Number(documentId)
      if (conversationId) payload.conversationId = conversationId

      const data = await askQuestion(payload)
      if (data?.conversationId) setConversationId(data.conversationId)
      if (data?.responseTimeMs != null) setLastResponseMs(data.responseTimeMs)

      setAssistantMessages((current) => [
        ...current,
        {
          role: 'assistant',
          question: text,
          answer: data?.answer || 'No answer returned.',
          citations: data?.citations || [],
          responseTimeMs: data?.responseTimeMs,
        },
      ])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-5">
      <div>
        <h1 className="text-2xl font-semibold text-white">Ask AI</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Ask questions about your uploaded documents and get answers based on their content.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <DocumentSelect
          documents={documents}
          value={documentId}
          onChange={setDocumentId}
          className="sm:max-w-xs"
        />
        <p className="text-xs text-zinc-500">
          Conversation {conversationId ? conversationId.slice(0, 8) : 'will start with the next question'}.
        </p>
      </div>

      <div className="flex min-h-[32.5rem] flex-col rounded-2xl border border-[#2a2a33] bg-[#111116]">
        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          {assistantMessages.length === 0 && !loading ? (
            <div className="flex h-full min-h-[280px] flex-col items-center justify-center text-center">
              <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/15 text-violet-300">
                <IconSpark className="h-6 w-6" />
              </span>
              <p className="text-sm font-medium text-white">Ask a question about your documents</p>
              <p className="mt-1 max-w-md text-sm text-zinc-500">
                See where each answer comes from, with document names, page numbers, and supporting text.
              </p>
            </div>
          ) : null}

          {assistantMessages.map((item, index) =>
            item.role === 'user' ? (
              <div key={`u-${index}`} className="ml-auto max-w-[36%] rounded-2xl bg-violet-600 px-4 py-3 text-sm text-white">
                {item.content}
              </div>
            ) : (
              <div key={`a-${index}`} className="max-w-[60%] space-y-3 rounded-2xl border border-[#2a2a33] bg-[#0c0c11] p-4">
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-100">{item.answer}</p>
                {item.responseTimeMs != null ? (
                  <p className="text-xs text-zinc-500">{(item.responseTimeMs / 1000).toFixed(2)} s</p>
                ) : null}
              </div>
            ),
          )}
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-violet-400 border-t-transparent" />
              Generating answer…
            </div>
          ) : null}
          <div ref={endRef} />
        </div>

        <form onSubmit={onSubmit} className="border-t border-[#2a2a33] p-3">
          <ErrorBanner message={error} />
          <div className="mt-3 flex gap-2">
            <textarea
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault()
                  event.currentTarget.form?.requestSubmit()
                }
              }}
              rows={2}
              placeholder="Ask a question…"
              className="min-h-[52px] flex-1 resize-none rounded-xl border border-[#2a2a33] bg-[#0c0c11] px-4 py-3 text-sm outline-none focus:border-violet-500"
            />
            <button
              type="submit"
              disabled={loading || !question.trim()}
              className="flex h-[52px] w-[52px] items-center justify-center rounded-xl bg-violet-600 text-white hover:bg-violet-500 disabled:opacity-40"
              aria-label="Send question"
            >
              <IconSend className="h-5 w-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
