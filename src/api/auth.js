import apiClient from './client'
import { persistSession } from './session'

const AUTH = '/api/auth'

export async function login(credentials) {
  const { data } = await apiClient.post(`${AUTH}/login`, {
    username: credentials.username,
    password: credentials.password,
  })
  persistSession(data)
  return data
}

export async function register(payload) {
  const { data } = await apiClient.post(`${AUTH}/register`, payload)
  persistSession(data)
  return data
}
