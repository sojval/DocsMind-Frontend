import apiClient, { unwrap } from './client'

const DOCUMENTS = '/api/v1/documents'

export async function listDocuments() {
  return unwrap(await apiClient.get(DOCUMENTS))
}

export async function getDocument(id) {
  return unwrap(await apiClient.get(`${DOCUMENTS}/${id}`))
}


export async function uploadDocument(file, onUploadProgress) {
  const form = new FormData()
  form.append('file', file)
  return unwrap(
    await apiClient.post(`${DOCUMENTS}/upload`, form, {
      onUploadProgress,
    }),
  )
}

export async function uploadMultipleDocuments(files, onUploadProgress) {
  const form = new FormData()
  files.forEach((file) => form.append('files', file))
  return unwrap(
    await apiClient.post(`${DOCUMENTS}/puload-multiple`, form, {
      onUploadProgress,
    }),
  )
}

export async function deleteDocument(id) {
  return unwrap(await apiClient.delete(`${DOCUMENTS}/${id}`))
}
