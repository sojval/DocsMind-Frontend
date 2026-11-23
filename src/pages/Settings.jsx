import { useApp } from '../context/AppContext'

export default function Settings() {
  const { preferences, setPreferences, conversationId, setConversationId, setAssistantMessages } = useApp()
  const apiBase = import.meta.env.VITE_API_BASE_URL || '(Vite proxy → http://localhost:8080)'

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Settings</h1>
        <p className="mt-1 text-sm text-zinc-400">
            Your search settings are automatically applied to Q&A and similarity search, keeping everything in sync with the backend.
        </p>
      </div>

      <section className="space-y-4 rounded-2xl border border-[#2a2a33] bg-[#111116] p-5">
        <label className="block text-sm">
          <span className="mb-1.5 block text-zinc-400">Top Results</span>
          <input
            type="number"
            min={1}
            max={50}
            value={preferences.topK}
            onChange={(event) =>
              setPreferences((current) => ({ ...current, topK: Number(event.target.value) || 1 }))
            }
            className="w-full rounded-xl border border-[#2a2a33] bg-[#0c0c11] px-3 py-2.5 outline-none focus:border-violet-500"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block text-zinc-400">Similarity Score (0–1)</span>
          <input
            type="number"
            min={0}
            max={1}
            step={0.05}
            value={preferences.similarity}
            onChange={(event) =>
              setPreferences((current) => ({
                ...current,
                similarity: Math.min(1, Math.max(0, Number(event.target.value) || 0)),
              }))
            }
            className="w-full rounded-xl border border-[#2a2a33] bg-[#0c0c11] px-3 py-2.5 outline-none focus:border-violet-500"
          />
        </label>
        <button
          type="button"
          onClick={() => {
            setConversationId('')
            setAssistantMessages([])
          }}
          className="rounded-xl border border-[#2a2a33] px-4 py-2 text-sm text-zinc-200 hover:bg-white/5"
        >
          Reset conversation {conversationId ? `(${conversationId.slice(0, 8)}…)` : ''}
        </button>
      </section>
    </div>
  )
}
