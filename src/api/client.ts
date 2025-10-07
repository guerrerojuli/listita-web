import { useAuthStore } from '@/stores/auth'

const DEFAULT_BASE_URL = 'http://localhost:8080'

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

interface ApiOptions extends RequestInit {
  method?: HttpMethod
  query?: Record<string, unknown | undefined>
  json?: unknown
}

function buildUrl(path: string, query?: Record<string, unknown | undefined>): string {
  const base = (import.meta as any).env?.VITE_API_BASE_URL || DEFAULT_BASE_URL
  const url = new URL(path.startsWith('/') ? path : `/${path}`, base)
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') return
      url.searchParams.set(key, String(value))
    })
  }
  return url.toString()
}

export async function apiFetch<T = unknown>(path: string, options: ApiOptions = {}): Promise<T> {
  const auth = useAuthStore()
  const { method = 'GET', query, json, headers, ...rest } = options
  const url = buildUrl(path, query)

  const finalHeaders: HeadersInit = {
    ...(json ? { 'Content-Type': 'application/json' } : {}),
    ...(headers || {}),
  }
  if (auth.token) {
    (finalHeaders as Record<string, string>)['Authorization'] = `Bearer ${auth.token}`
  }

  const response = await fetch(url, {
    method,
    headers: finalHeaders,
    body: json !== undefined ? JSON.stringify(json) : undefined,
    ...rest,
  })

  if (!response.ok) {
    let errorBody: unknown
    try {
      errorBody = await response.json()
    } catch {
      // ignore
    }
    const error = new Error(`API ${method} ${path} failed: ${response.status}`)
    ;(error as any).status = response.status
    ;(error as any).body = errorBody
    throw error
  }

  const contentType = response.headers.get('content-type') || ''
  if (contentType.includes('application/json')) {
    return (await response.json()) as T
  }
  return undefined as unknown as T
}


