export type ApiError = {
  status?: number
  message: string
}

import { getOrCreateUserId } from './userId'
import axios, { AxiosError, AxiosHeaders } from 'axios'
import type { AxiosInstance } from 'axios'

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

const client: AxiosInstance = axios.create({
  baseURL: '/',
  timeout: 10_000,
  headers: {
    Accept: 'application/json',
  },
})

client.interceptors.request.use((config) => {
  const userId = typeof window !== 'undefined' ? getOrCreateUserId() : undefined
  if (userId) {
    const headers = AxiosHeaders.from(config.headers ?? {})
    headers.set('x-user-id', userId)
    config.headers = headers
  }
  return config
})

export async function apiGet<T>(path: string): Promise<T> {
  return apiFetch<T>(path, { method: 'GET' })
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  return apiFetch<T>(path, { method: 'POST', body })
}

type ApiFetchInit =
  | { method: 'GET' }
  | {
      method: 'POST'
      body: unknown
    }

async function apiFetch<T>(path: string, init: ApiFetchInit): Promise<T> {
  const url = path.startsWith('/api') ? path : `/api${path.startsWith('/') ? '' : '/'}${path}`
  const dev = typeof import.meta !== 'undefined' && Boolean(import.meta.env?.DEV)

  let lastErr: unknown
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const res =
        init.method === 'GET'
          ? await client.get<T>(url)
          : await client.post<T>(url, init.body, { headers: { 'Content-Type': 'application/json' } })

      if (dev) {
        const headers = res.headers as Record<string, string | undefined>
        const fallback = headers['x-netflim-fallback']
        const fallbackRoute = headers['x-netflim-fallback-route']

        const data = res.data as unknown
        const count = (() => {
          if (!data || typeof data !== 'object') return undefined
          if (!('results' in data)) return undefined
          const results = (data as { results?: unknown }).results
          return Array.isArray(results) ? results.length : undefined
        })()

        if (fallback) {
          // eslint-disable-next-line no-console
          console.warn('[api]', url, 'fallback', fallbackRoute || '', count != null ? `results=${count}` : '')
        } else if (count != null) {
          // eslint-disable-next-line no-console
          console.debug('[api]', url, `results=${count}`)
        }
      }

      return res.data
    } catch (err) {
      lastErr = err
      const ax = err as AxiosError<unknown>
      const status = ax.response?.status
      const data = ax.response?.data
      const message =
        (data && typeof data === 'object' && 'error' in data && typeof (data as { error?: unknown }).error === 'string'
          ? (data as { error: string }).error
          : ax.message) || 'Request failed'
      const retryable = !status || status >= 500 || status === 429

      if (!retryable || attempt === 2) {
        const e: ApiError = { status, message }
        throw e
      }

      await sleep(200 * (attempt + 1))
    }
  }

  const message = lastErr instanceof Error ? lastErr.message : 'Request failed'
  throw new Error(message)
}
