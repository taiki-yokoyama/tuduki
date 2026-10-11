import type { ApiErrorShape } from '../types'

const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:8081/api'
const apiOrigin = apiUrl.replace(/\/api\/?$/, '')

export class ApiError extends Error {
  status: number
  errors: Record<string, string[]>

  constructor(status: number, body: ApiErrorShape) {
    super(body.message || 'API request failed.')
    this.name = 'ApiError'
    this.status = status
    this.errors = body.errors ?? {}
  }
}

function xsrfToken(): string {
  const value = document.cookie
    .split('; ')
    .find((cookie) => cookie.startsWith('XSRF-TOKEN='))
    ?.split('=').slice(1).join('=')

  return value ? decodeURIComponent(value) : ''
}

async function ensureCsrf(): Promise<void> {
  const response = await fetch(`${apiOrigin}/sanctum/csrf-cookie`, {
    credentials: 'include',
    headers: { Accept: 'application/json' },
  })

  if (!response.ok) {
    throw new ApiError(response.status, { message: 'CSRF cookie could not be created.' })
  }
}

export async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const method = (init.method ?? 'GET').toUpperCase()
  const mutating = !['GET', 'HEAD', 'OPTIONS'].includes(method)

  if (mutating) {
    await ensureCsrf()
  }

  const headers = new Headers(init.headers)
  headers.set('Accept', 'application/json')
  if (mutating) {
    headers.set('X-XSRF-TOKEN', xsrfToken())
  }

  const response = await fetch(`${apiUrl}${path}`, {
    ...init,
    credentials: 'include',
    headers,
  })
  const text = await response.text()
  let body: unknown = null

  if (text !== '') {
    try {
      body = JSON.parse(text)
    } catch {
      body = { message: text }
    }
  }

  if (!response.ok) {
    const errorBody = typeof body === 'object' && body !== null
      ? body as ApiErrorShape
      : { message: 'API request failed.' }
    throw new ApiError(response.status, errorBody)
  }

  return body as T
}

export async function getCurrentUser<T>(): Promise<T | null> {
  try {
    return await request<T>('/auth/me')
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      return null
    }
    throw error
  }
}

export { apiUrl }
