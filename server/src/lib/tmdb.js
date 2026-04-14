const axios = require('axios')
const { createCache } = require('./cache')
const { env } = require('../config/env')

const tmdbCache = createCache({ ttlMs: 10 * 60 * 1000, max: 1000 })

const DEBUG = (() => {
  const v = String(env.DEBUG_TMDB || '').trim().toLowerCase()
  return Boolean(v && v !== '0' && v !== 'false' && v !== 'off')
})()

const safePath = (path) => String(path || '').replace(/\?.*$/, '')

const log = (...args) => {
  if (!DEBUG) return
  // eslint-disable-next-line no-console
  console.log('[tmdb]', ...args)
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const makeKey = (path, params) => {
  const query = new URLSearchParams(params).toString()
  return query ? `${path}?${query}` : path
}

const tmdbGet = async (path, params = {}, { cache = true } = {}) => {
  if (!env.TMDB_API_KEY) {
    const error = new Error('TMDB_API_KEY is not configured')
    error.status = 503
    throw error
  }

  const normalizedParams = {
    ...params,
    api_key: env.TMDB_API_KEY,
  }

  const key = makeKey(path, normalizedParams)
  if (cache && tmdbCache.has(key)) {
    log('cache hit', safePath(path))
    return tmdbCache.get(key)
  }

  const url = `${env.TMDB_BASE_URL}${path}`

  log('GET', safePath(path))

  let lastError
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const startedAt = Date.now()
      const res = await axios.get(url, {
        params: normalizedParams,
        timeout: 10_000,
      })
      const ms = Date.now() - startedAt
      const count = Array.isArray(res?.data?.results) ? res.data.results.length : undefined
      log('ok', safePath(path), `${res.status}`, `${ms}ms`, count != null ? `results=${count}` : '')
      if (cache) tmdbCache.set(key, res.data)
      return res.data
    } catch (err) {
      lastError = err
      const status = err?.response?.status
      const msg = err?.response?.data?.status_message || err?.message
      log('err', safePath(path), status || 'no-status', msg)
      const isRetryable = !status || status >= 500 || status === 429
      if (!isRetryable || attempt === 2) break
      await sleep(250 * (attempt + 1))
    }
  }

  const status = lastError?.response?.status || 500
  const message = lastError?.response?.data?.status_message || lastError?.message || 'TMDB request failed'
  const error = new Error(message)
  error.status = status
  throw error
}

module.exports = { tmdbGet }
