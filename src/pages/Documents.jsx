import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import ErrorBanner from '../components/ErrorBanner'
import { IconTrash, IconUpload } from '../components/Icons'
import LoadingBlock from '../components/LoadingBlock'
import StatusBadge from '../components/StatusBadge'
import { useApp } from '../context/AppContext'
import { deleteDocument, uploadDocument, uploadMultipleDocuments } from '../api/documents'
import {
  ACCEPTED_TYPES,
  documentChunks,
  documentName,
  documentSize,
  documentStatus,
  formatBytes,
  formatDate,
} from '../utils/format'

export default function Documents() {
  const inputRef = useRef(null)
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { documents, documentsLoading, documentsError, refreshDocuments } = useApp()
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [dragging, setDragging] = useState(false)

  async function handleFiles(fileList) {
    const files = Array.from(fileList || [])
    if (!files.length) return
    if (!isAuthenticated) {
      if (inputRef.current) inputRef.current.value = ''
      navigate('/login', { state: { from: '/documents', action: 'upload' } })
      return
    }
    setBusy(true)
    setError('')
    setMessage('')
    try {
      if (files.length === 1) {
        const result = await uploadDocument(files[0])
        setMessage(
          `${result?.fileName || files[0].name}: ${result?.chunksCreated ?? 0} chunks indexed.`,
        )
      } else {
        const results = await uploadMultipleDocuments(files)
        const count = Array.isArray(results) ? results.length : files.length
        const chunks = Array.isArray(results)
          ? results.reduce((total, result) => total + (result?.chunksCreated ?? 0), 0)
          : 0
        setMessage(`${count} files indexed into ${chunks} chunks.`)
      }
      await refreshDocuments()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  async function onDelete(id) {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/documents', action: 'delete' } })
      return
    }
    if (!window.confirm('Delete this document and its embeddings?')) return
    setBusy(true)
    setError('')
    try {
      await deleteDocument(id)
      await refreshDocuments()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Documents</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Upload your files and let AI organize their content for easy searching. Supports PDF, DOCX, TXT, MD, and CSV files.
        </p>
      </div>

      <label
        onDragOver={(event) => {
          event.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault()
          setDragging(false)
          handleFiles(event.dataTransfer.files)
        }}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed px-6 py-12 text-center transition ${
          dragging ? 'border-violet-400 bg-violet-500/10' : 'border-[#2a2a33] bg-[#111116]'
        }`}
      >
        <IconUpload className="mb-3 h-8 w-8 text-violet-300" />
        <p className="text-sm font-medium text-white">Drop files here or click to browse</p>
        <p className="mt-1 text-xs text-zinc-500">Single or multiple files. Indexing may take a moment.</p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPTED_TYPES}
          className="hidden"
          onChange={(event) => handleFiles(event.target.files)}
        />
      </label>

      {busy ? <LoadingBlock label="Uploading and indexing. This can take a minute…" /> : null}
      <ErrorBanner message={error} />
      <ErrorBanner message={documentsError} onRetry={refreshDocuments} />
      {message ? (
        <p className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          {message}
        </p>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-[#2a2a33] bg-[#111116]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-[#2a2a33] text-xs uppercase tracking-wide text-zinc-500">
              <tr>
                <th className="px-4 py-3 font-medium">File</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Pages</th>
                <th className="px-4 py-3 font-medium">Chunks</th>
                <th className="px-4 py-3 font-medium">Size</th>
                <th className="px-4 py-3 font-medium">Uploaded</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2a33]">
              {documentsLoading && documents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-zinc-500">
                    Loading documents…
                  </td>
                </tr>
              ) : documents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-zinc-500">
                    No documents indexed yet.
                  </td>
                </tr>
              ) : (
                documents.map((doc) => (
                  <tr key={doc.id} className="align-top">
                    <td className="px-4 py-3">
                      <p className="font-medium text-zinc-100">{documentName(doc)}</p>
                      <p className="text-xs text-zinc-500">{doc.contentType || 'unknown type'}</p>
                      {documentStatus(doc) === 'FAILED' && doc.error ? (
                        <p className="mt-1 text-xs text-rose-300">{doc.error}</p>
                      ) : null}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={documentStatus(doc)} />
                    </td>
                    <td className="px-4 py-3 text-zinc-400">{doc.total ?? '—'}</td>
                    <td className="px-4 py-3 text-zinc-400">{documentChunks(doc) ?? '—'}</td>
                    <td className="px-4 py-3 text-zinc-400">{formatBytes(documentSize(doc))}</td>
                    <td className="px-4 py-3 text-zinc-400">{formatDate(doc.createdAt)}</td>
                    <td className="px-4 py-3">

                      <div className="flex justify-end gap-10">
                        <Link
                            to="/ask"
                            state={{ documentId: String(doc.id) }}
                            className="rounded-lg px-2 py-1 text-blue-400 hover:bg-blue-500/10 hover:text-blue-300 transition-colors"
                        >
                          Ask
                        </Link>

                        <button
                            type="button"
                            onClick={() => onDelete(doc.id)}
                            className="rounded-lg p-1.5 text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                            aria-label={`Delete ${documentName(doc)}`}
                        >
                          <IconTrash className="h-4 w-4" />
                        </button>
                      </div>

                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
