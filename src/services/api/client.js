const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/+$/, '')
const REQUEST_TIMEOUT_MS = 15000

export class ApiError extends Error {
  constructor(message, status = 0, code = 'NETWORK_ERROR', details = null) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
  }
}

function getErrorMessage(data, status) {
  if (typeof data?.error === 'string') return data.error
  if (typeof data?.message === 'string') return data.message
  if (status === 503) return 'O serviço está temporariamente indisponível.'
  if (status === 401) return 'Sua sessão expirou. Entre novamente.'
  if (status === 403) return 'Você não tem permissão para esta ação.'
  if (status === 404) return 'Recurso não encontrado.'
  if (status === 409) return 'Esta operação entrou em conflito com os dados atuais.'
  return 'Não foi possível concluir. Tente novamente.'
}

export async function apiRequest(path, options = {}) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  const headers = new Headers(options.headers || {})
  if (options.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json')

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
      signal: controller.signal,
    })
    const data = await response.json().catch(() => null)
    if (!response.ok) {
      throw new ApiError(getErrorMessage(data, response.status), response.status, data?.code || `HTTP_${response.status}`, data)
    }
    return data
  } catch (error) {
    if (error instanceof ApiError) throw error
    if (error.name === 'AbortError') throw new ApiError('A solicitação demorou demais. Verifique sua conexão.', 0, 'TIMEOUT')
    throw new ApiError('Não foi possível conectar à CronoRacing.', 0, 'NETWORK_ERROR')
  } finally {
    clearTimeout(timeout)
  }
}

function withToken(token, options = {}) {
  return {
    ...options,
    headers: {
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  }
}

export const authApi = {
  login: (payload) => apiRequest('/api/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  register: (payload) => apiRequest('/api/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  me: (token) => apiRequest('/api/auth/me', withToken(token)),
}

export const publicApi = {
  showcase: (params = {}) => {
    const query = new URLSearchParams(Object.entries(params).filter(([, value]) => value !== '' && value != null))
    return apiRequest(`/api/public/landing-showcase${query.toString() ? `?${query}` : ''}`)
  },
  event: (idOrSlug) => apiRequest(`/api/public/events/${encodeURIComponent(idOrSlug)}`),
  results: (eventId, params = {}) => {
    const query = new URLSearchParams(Object.entries(params).filter(([, value]) => value !== '' && value != null))
    return apiRequest(`/api/public/events/${encodeURIComponent(eventId)}/results${query.toString() ? `?${query}` : ''}`)
  },
}

export const championshipsApi = {
  list: (token) => apiRequest('/api/championships', withToken(token)),
  create: (token, payload) => apiRequest('/api/championships', withToken(token, { method: 'POST', body: JSON.stringify(payload) })),
}

export const racesApi = {
  create: (token, payload) => apiRequest('/api/races', withToken(token, { method: 'POST', body: JSON.stringify(payload) })),
  config: (token, raceId) => apiRequest(`/api/races/${encodeURIComponent(raceId)}/config`, withToken(token)),
  addModality: (token, raceId, payload) => apiRequest(`/api/races/${encodeURIComponent(raceId)}/modalities`, withToken(token, { method: 'POST', body: JSON.stringify(payload) })),
  addCategory: (token, raceId, payload) => apiRequest(`/api/races/${encodeURIComponent(raceId)}/categories`, withToken(token, { method: 'POST', body: JSON.stringify(payload) })),
  addKit: (token, raceId, payload) => apiRequest(`/api/races/${encodeURIComponent(raceId)}/kits`, withToken(token, { method: 'POST', body: JSON.stringify(payload) })),
  updateStatus: (token, raceId, status) => apiRequest(`/api/races/${encodeURIComponent(raceId)}/status`, withToken(token, { method: 'PATCH', body: JSON.stringify({ status }) })),
}
