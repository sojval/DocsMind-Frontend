import apiClient, { unwrap } from './client'

export async function askQuestion(request) {
  return unwrap(await apiClient.post('/query', request))
}

export async function searchSimilar(request) {
  return unwrap(await apiClient.post('/search/similarity', request))
}
