import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { listDocuments } from '../api/documents'
import { useAuth } from './AuthContext'

const STORAGE_KEY = 'docsmind.preferences'
const CONVO_KEY = 'docsmind.conversationId'

const AppContext = createContext(null)

function loadPreferences() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { topK: 5, similarity: 0 }
    const parsed = JSON.parse(raw)
    return {
      topK: Number(parsed.topK) || 5,
      similarity: Number(parsed.similarity) || 0,
    }
  } catch {
    return { topK: 5, similarity: 0 }
  }
}

export function AppProvider({ children }) {
  const { isAuthenticated, user } = useAuth()
  const [documents, setDocuments] = useState([])
  const [documentsLoading, setDocumentsLoading] = useState(true)
  const [documentsError, setDocumentsError] = useState('')
  const [preferences, setPreferences] = useState(loadPreferences)
  const [conversationId, setConversationId] = useState(
    () => sessionStorage.getItem(CONVO_KEY) || '',
  )
  const [lastResponseMs, setLastResponseMs] = useState(null)
  const [assistantMessages, setAssistantMessages] = useState([])
  const [questionCounts, setQuestionCounts] = useState(() => {
    try { return JSON.parse(localStorage.getItem('docsmind.questionCounts') || '{}') } catch { return {} }
  })
  const accountKey = String(user?.id || user?.username || 'guest')
  const questionCount = Number(questionCounts[accountKey] || 0)

  const incrementQuestionCount = useCallback(() => {
    setQuestionCounts((current) => {
      const next = { ...current, [accountKey]: Number(current[accountKey] || 0) + 1 }
      localStorage.setItem('docsmind.questionCounts', JSON.stringify(next))
      return next
    })
  }, [accountKey])

  const refreshDocuments = useCallback(async () => {
    setDocumentsLoading(true)
    setDocumentsError('')
    try {
      const data = await listDocuments()
      setDocuments(Array.isArray(data) ? data : [])
    } catch (error) {
      setDocumentsError(error.message)
      setDocuments([])
    } finally {
      setDocumentsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!isAuthenticated) {
      setDocuments([])
      setDocumentsLoading(false)
      setDocumentsError('')
      return
    }
    refreshDocuments()
  }, [isAuthenticated, refreshDocuments])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences))
  }, [preferences])

  useEffect(() => {
    if (conversationId) sessionStorage.setItem(CONVO_KEY, conversationId)
    else sessionStorage.removeItem(CONVO_KEY)
  }, [conversationId])

  const value = useMemo(
    () => ({
      documents,
      documentsLoading,
      documentsError,
      refreshDocuments,
      preferences,
      setPreferences,
      conversationId,
      setConversationId,
      lastResponseMs,
      setLastResponseMs,
      assistantMessages,
      setAssistantMessages,
      questionCount,
      incrementQuestionCount,
    }),
    [
      documents,
      documentsLoading,
      documentsError,
      refreshDocuments,
      preferences,
      conversationId,
      lastResponseMs,
      assistantMessages,
      questionCount,
      incrementQuestionCount,
    ],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) throw new Error('useApp must be used within AppProvider')
  return context
}
