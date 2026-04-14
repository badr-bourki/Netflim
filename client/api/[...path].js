const TMDB_BASE_URL = process.env.TMDB_BASE_URL || 'https://api.themoviedb.org/3'
const TMDB_API_KEY = process.env.TMDB_API_KEY || ''

const mockPaged = (items) => ({
  page: 1,
  results: items,
  total_pages: 1,
  total_results: items.length,
})

const MOCK_RESULTS = [
  {
    id: 603,
    media_type: 'movie',
    title: 'The Matrix',
    poster_path: '/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg',
    backdrop_path: '/icmmSD4vTTDKOq2vvdulafOGw93.jpg',
    overview: 'A hacker discovers reality is a simulation and joins a rebellion.',
    release_date: '1999-03-30',
    vote_average: 8.2,
  },
  {
    id: 1399,
    media_type: 'tv',
    name: 'Game of Thrones',
    poster_path: '/7WUHnWGx5OO145IRxPDUkQSh4C7.jpg',
    backdrop_path: '/suopoADq0k8YZr4dQXcU6pToj6s.jpg',
    overview: 'Nine noble families fight for control over the lands of Westeros.',
    first_air_date: '2011-04-17',
    vote_average: 8.4,
  },
]

const getMockTrending = () => mockPaged(MOCK_RESULTS)

const getMockMovies = () => {
  const movies = MOCK_RESULTS.filter((r) => r.media_type === 'movie').map((r) => ({
    id: r.id,
    title: r.title,
    poster_path: r.poster_path,
    backdrop_path: r.backdrop_path,
    overview: r.overview,
    release_date: r.release_date,
    vote_average: r.vote_average,
  }))
  return mockPaged(movies)
}

const getMockTv = () => {
  const shows = MOCK_RESULTS.filter((r) => r.media_type === 'tv').map((r) => ({
    id: r.id,
    name: r.name,
    poster_path: r.poster_path,
    backdrop_path: r.backdrop_path,
    overview: r.overview,
    first_air_date: r.first_air_date,
    vote_average: r.vote_average,
  }))
  return mockPaged(shows)
}

const json = (res, status, body, headers = {}) => {
  Object.entries(headers).forEach(([k, v]) => res.setHeader(k, v))
  res.status(status).json(body)
}

const parseIntSafe = (v, fallback = 1) => {
  const n = Number(v)
  if (!Number.isFinite(n)) return fallback
  return Math.max(1, Math.min(500, Math.trunc(n)))
}

const tmdbGet = async (path, params = {}) => {
  if (!TMDB_API_KEY) {
    const err = new Error('TMDB_API_KEY missing')
    err.status = 503
    throw err
  }

  const query = new URLSearchParams({ ...params, api_key: TMDB_API_KEY }).toString()
  const url = `${TMDB_BASE_URL}${path}?${query}`
  const resp = await fetch(url, { method: 'GET' })
  if (!resp.ok) {
    const text = await resp.text()
    const err = new Error(text || `TMDB failed: ${resp.status}`)
    err.status = resp.status
    throw err
  }
  return resp.json()
}

module.exports = async (req, res) => {
  const method = req.method || 'GET'
  const full = (req.url || '').split('?')
  const pathname = (full[0] || '').replace(/^\/api/, '') || '/'
  const search = new URLSearchParams(full[1] || '')

  try {
    if (method === 'GET' && pathname === '/trending') {
      try {
        const type = search.get('type') || 'all'
        const time = search.get('time') || 'week'
        const data = await tmdbGet(`/trending/${type}/${time}`, { language: 'en-US' })
        return json(res, 200, data)
      } catch (err) {
        return json(res, 200, getMockTrending(), { 'x-netflim-fallback': 'tmdb-mock' })
      }
    }

    if (method === 'GET' && pathname === '/movies') {
      try {
        const page = parseIntSafe(search.get('page'))
        const category = search.get('category') || 'popular'
        const genre = search.get('genre')
        const data = genre
          ? await tmdbGet('/discover/movie', {
              language: 'en-US',
              page: String(page),
              sort_by: 'popularity.desc',
              with_genres: genre,
              include_adult: 'false',
            })
          : await tmdbGet(`/movie/${category}`, {
              language: 'en-US',
              page: String(page),
            })
        return json(res, 200, data)
      } catch (err) {
        return json(res, 200, getMockMovies(), { 'x-netflim-fallback': 'tmdb-mock' })
      }
    }

    if (method === 'GET' && pathname === '/tv') {
      try {
        const page = parseIntSafe(search.get('page'))
        const category = search.get('category') || 'popular'
        const genre = search.get('genre')
        const data = genre
          ? await tmdbGet('/discover/tv', {
              language: 'en-US',
              page: String(page),
              sort_by: 'popularity.desc',
              with_genres: genre,
            })
          : await tmdbGet(`/tv/${category}`, {
              language: 'en-US',
              page: String(page),
            })
        return json(res, 200, data)
      } catch (err) {
        return json(res, 200, getMockTv(), { 'x-netflim-fallback': 'tmdb-mock' })
      }
    }

    if (method === 'GET' && pathname === '/mylist') {
      return json(res, 200, { items: [] })
    }

    if (method === 'POST' && pathname === '/mylist') {
      return json(res, 200, { ok: true, persisted: false })
    }

    if (method === 'GET' && pathname === '/progress') {
      return json(res, 200, { items: [] })
    }

    if (method === 'POST' && pathname === '/progress') {
      return json(res, 200, { ok: true, persisted: false })
    }

    if (method === 'GET' && pathname === '/health') {
      return json(res, 200, { ok: true })
    }

    return json(res, 404, { error: 'Not found' })
  } catch (err) {
    return json(res, 500, { error: err?.message || 'Server error' })
  }
}
