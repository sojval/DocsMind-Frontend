import axios from 'axios'
import { getStoredToken } from './session'

const baseURL = import.meta.env.VITE_API_BASE_URL ?? ''

const apiClient = axios.create({
  baseURL,
  timeout: 300000,
})

apiClient.interceptors.request.use((config) => {
  const token = getStoredToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
    const headers = config.headers
    if (headers) {
      if (typeof headers.delete === 'function') {
        headers.delete('Content-Type')
        headers.delete('content-type')
      } else {
        delete headers['Content-Type']
        delete headers['content-type']
      }
    }
  }
  return config
})

function extractMessage(payload, fallback) {
  if (!payload) return fallback
  if (typeof payload === 'string') return payload
  if (payload.message) return payload.message
  return fallback
}

apiClient.interceptors.response.use(
  (response) => {
    const payload = response.data
    if (
      payload &&
      typeof payload === 'object' &&
      Object.prototype.hasOwnProperty.call(payload, 'success') &&
      payload.success === false
    ) {
      const error = new Error(extractMessage(payload, 'Request failed'))
      error.status = response.status
      error.payload = payload
      return Promise.reject(error)
    }
    return response
  },
  (error) => {
    const payload = error.response?.data
    const status = error.response?.status
    const requestUrl = String(error.config?.url || '')
    if (status === 401 && typeof window !== 'undefined' && !requestUrl.includes('/api/auth/')) {
      window.dispatchEvent(new CustomEvent('docsmind:unauthorized'))
    }
    let fallback = error.message || 'Unable to reach the DocsMind API'
    if (!error.response) {
      fallback = 'Unable to reach the DocsMind API. Confirm the backend is running.'
    } else if (status === 401) {
      fallback = extractMessage(payload, 'Please sign in to continue')
    } else if (status === 502 || status === 504) {
      fallback = 'The API proxy could not reach Spring Boot at http://localhost:8080.'
    }
    const wrapped = new Error(extractMessage(payload, fallback))
    wrapped.status = status
    wrapped.payload = payload
    return Promise.reject(wrapped)
  },
)

export function unwrap(response) {
  const body = response.data
  if (body && typeof body === 'object' && Object.prototype.hasOwnProperty.call(body, 'data')) {
    return body.data
  }
  return body
}

export default apiClient
