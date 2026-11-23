import { documentName } from '../utils/format'

export default function DocumentSelect({ documents, value, onChange, className = '' }) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className={`rounded-xl border border-[#2a2a33] bg-[#111116] px-3 py-2.5 text-sm text-zinc-200 outline-none focus:border-violet-500 ${className}`}
    >
      <option value="">All indexed documents</option>
      {documents.map((doc) => (
        <option key={doc.id} value={doc.id}>
          {documentName(doc)}
        </option>
      ))}
    </select>
  )
}
