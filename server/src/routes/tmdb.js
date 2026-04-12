const express = require('express')
const { z } = require('zod')
const { tmdbGet } = require('../lib/tmdb')
const { env } = require('../config/env')
const { getMockTrending, getMockMovies, getMockTv, getMockSearch } = require('../lib/tmdbMock')

const router = express.Router()

const DEBUG = (() => {
  const v = String(env.DEBUG_TMDB || '').trim().toLowerCase()
  return Boolean(v && v !== '0' && v !== 'false' && v !== 'off')
})()

const log = (...args) => {
  if (!DEBUG) return
  // eslint-disable-next-line no-console
  console.log('[routes/tmdb]', ...args)
}

const sendMockFallback = (res, routeName, err, data) => {
  const status = err?.status || err?.response?.status || 502
  const message = err?.message || 'TMDB request failed'

  log('fallback', routeName, status, message)
  res.set('x-netflim-fallback', 'tmdb-mock')
  res.set('x-netflim-fallback-route', routeName)
  res.set('x-netflim-fallback-status', String(status))
  res.json(data)
}

const intFromQuery = (value, fallback) => {
  const n = Number(value)
  if (!Number.isFinite(n)) return fallback
  return Math.trunc(n)
}

router.get('/trending', async (req, res, next) => {
  try {
    const schema = z.object({
      type: z.enum(['all', 'movie', 'tv']).optional(),
      time: z.enum(['day', 'week']).optional(),
    })

    const { type = 'all', time = 'week' } = schema.parse(req.query)
    const data = await tmdbGet(`/trending/${type}/${time}`, { language: 'en-US' })
    res.json(data)
  } catch (err) {
    sendMockFallback(res, 'trending', err, getMockTrending())
  }
})

router.get('/movies', async (req, res, next) => {
  try {
    const schema = z.object({
      page: z.string().optional(),
      category: z.enum(['popular', 'top_rated', 'now_playing', 'upcoming']).optional(),
      genre: z.string().optional(),
    })

    const { page, category = 'popular', genre } = schema.parse(req.query)
    const pageNum = Math.min(Math.max(intFromQuery(page, 1), 1), 500)

    const data = genre
      ? await tmdbGet('/discover/movie', {
          language: 'en-US',
          page: pageNum,
          sort_by: 'popularity.desc',
          with_genres: genre,
          include_adult: false,
        })
      : await tmdbGet(`/movie/${category}`, {
          language: 'en-US',
          page: pageNum,
        })

    res.json(data)
  } catch (err) {
    sendMockFallback(res, 'movies', err, getMockMovies())
  }
})

router.get('/tv', async (req, res, next) => {
  try {
    const schema = z.object({
      page: z.string().optional(),
      category: z.enum(['popular', 'top_rated', 'on_the_air', 'airing_today']).optional(),
      genre: z.string().optional(),
    })

    const { page, category = 'popular', genre } = schema.parse(req.query)
    const pageNum = Math.min(Math.max(intFromQuery(page, 1), 1), 500)

    const data = genre
      ? await tmdbGet('/discover/tv', {
          language: 'en-US',
          page: pageNum,
          sort_by: 'popularity.desc',
          with_genres: genre,
        })
      : await tmdbGet(`/tv/${category}`, {
          language: 'en-US',
          page: pageNum,
        })

    res.json(data)
  } catch (err) {
    sendMockFallback(res, 'tv', err, getMockTv())
  }
})

router.get('/details/:type/:id', async (req, res, next) => {
  try {
    const schema = z.object({
      type: z.enum(['movie', 'tv']),
      id: z.string().regex(/^\d+$/),
    })

    const { type, id } = schema.parse(req.params)

    const data = await tmdbGet(`/${type}/${id}`, {
      language: 'en-US',
      append_to_response: 'credits,videos,similar,recommendations',
    })

    res.json(data)
  } catch (err) {
    next(err)
  }
})

router.get('/search', async (req, res, next) => {
  try {
    const schema = z.object({
      q: z.string().min(1).max(120),
      page: z.string().optional(),
    })

    const { q, page } = schema.parse(req.query)
    const pageNum = Math.min(Math.max(intFromQuery(page, 1), 1), 500)

    const data = await tmdbGet('/search/multi', {
      query: q,
      language: 'en-US',
      page: pageNum,
      include_adult: false,
    })

    res.json(data)
  } catch (err) {
    const q = typeof req.query.q === 'string' ? req.query.q : ''
    sendMockFallback(res, 'search', err, getMockSearch(q))
  }
})

module.exports = { tmdbRouter: router }
