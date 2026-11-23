import { formatScore } from '../utils/format'

export default function CitationList({ citations, emptyLabel = 'No citations returned.' }) {
  if (!citations?.length) {
    return <p className="text-sm text-zinc-500">{emptyLabel}</p>
  }

  return (
    <ul className="space-y-3">
      {citations.map((citation, index) => (
        <li key={`${citation.documentId}-${citation.chunkIndex}-${index}`} className="rounded-xl border border-[#2a2a33] bg-[#111116] p-3">
          <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-zinc-400">
            <span className="font-medium text-zinc-200">{citation.fileName || 'Source'}</span>
            {citation.pageNumber != null ? <span className="rounded-md bg-[#1c1c24] px-1.5 py-0.5">p. {citation.pageNumber}</span> : null}
            {citation.chunkIndex != null ? <span className="rounded-md bg-[#1c1c24] px-1.5 py-0.5">chunk {citation.chunkIndex}</span> : null}
            <span className="ml-auto text-violet-300">score {formatScore(citation.similarityScore)}</span>
          </div>
          {citation.support ? <p className="line-clamp-5 text-sm leading-relaxed text-zinc-300">{citation.support}</p> : null}
        </li>
      ))}
    </ul>
  )
}
