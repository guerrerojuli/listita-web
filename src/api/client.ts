const DEFAULT_BASE_URL = 'http://localhost:8080'

class Api {
  static token: string | null = null

  static get baseUrl(): string {
    return (
      (import.meta as { env?: { VITE_API_BASE_URL?: string } }).env?.VITE_API_BASE_URL ||
      DEFAULT_BASE_URL
    )
  }

  static get timeout(): number {
    return 60 * 1000
  }

  private static buildUrl(path: string, query?: Record<string, unknown | undefined>): string {
    const url = new URL(path.startsWith('/') ? path : `/${path}`, Api.baseUrl)
    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') return
        url.searchParams.set(key, String(value))
      })
    }
    return url.toString()
  }

  static async fetch<T = unknown>(
    url: string,
    secure: boolean,
    init: RequestInit = {},
    controller?: AbortController,
  ): Promise<T> {
    if (secure && Api.token) {
      if (!init.headers) {
        init.headers = {}
      }
      ;(init.headers as Record<string, string>)['Authorization'] = `Bearer ${Api.token}`
    }

    controller = controller || new AbortController()
    init.signal = controller.signal
    const timer = setTimeout(() => controller!.abort(), Api.timeout)

    try {
      const response = await fetch(url, init)

      if (!response.ok) {
        let errorBody: { message?: string } | undefined
        try {
          errorBody = await response.json()
        } catch {
          // ignore
        }
        const errorMessage = errorBody?.message || `API request failed: ${response.status}`
        const error = new Error(errorMessage) as Error & {
          status?: number
          body?: { message?: string }
        }
        error.status = response.status
        error.body = errorBody
        throw error
      }

      const contentType = response.headers.get('content-type') || ''
      if (contentType.includes('application/json')) {
        return (await response.json()) as T
      }
      return undefined as unknown as T
    } catch (error: unknown) {
      const err = error as Error
      if (err.name === 'AbortError' || err.name === 'TypeError') {
        throw { message: err.message }
      } else {
        throw error
      }
    } finally {
      clearTimeout(timer)
    }
  }

  static async get<T = unknown>(
    path: string,
    secure: boolean = true,
    query?: Record<string, unknown | undefined>,
    controller?: AbortController,
  ): Promise<T> {
    const url = Api.buildUrl(path, query)
    return await Api.fetch<T>(url, secure, {}, controller)
  }

  static async post<T = unknown>(
    path: string,
    secure: boolean = true,
    data?: unknown,
    query?: Record<string, unknown | undefined>,
    controller?: AbortController,
  ): Promise<T> {
    const url = Api.buildUrl(path, query)
    return await Api.fetch<T>(
      url,
      secure,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
        body: data !== undefined ? JSON.stringify(data) : undefined,
      },
      controller,
    )
  }

  static async put<T = unknown>(
    path: string,
    secure: boolean = true,
    data?: unknown,
    controller?: AbortController,
  ): Promise<T> {
    const url = Api.buildUrl(path)
    return await Api.fetch<T>(
      url,
      secure,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
        body: data !== undefined ? JSON.stringify(data) : undefined,
      },
      controller,
    )
  }

  static async patch<T = unknown>(
    path: string,
    secure: boolean = true,
    data?: unknown,
    controller?: AbortController,
  ): Promise<T> {
    const url = Api.buildUrl(path)
    return await Api.fetch<T>(
      url,
      secure,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
        body: data !== undefined ? JSON.stringify(data) : undefined,
      },
      controller,
    )
  }

  static async delete<T = unknown>(
    path: string,
    secure: boolean = true,
    controller?: AbortController,
  ): Promise<T> {
    const url = Api.buildUrl(path)
    return await Api.fetch<T>(
      url,
      secure,
      {
        method: 'DELETE',
      },
      controller,
    )
  }
}

export { Api }
