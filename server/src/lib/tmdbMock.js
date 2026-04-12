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
  {
    id: 157336,
    media_type: 'movie',
    title: 'Interstellar',
    poster_path: '/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    backdrop_path: '/rAiYTfKGqDCRIIqo664sY9XZIvQ.jpg',
    overview: 'Explorers travel through a wormhole in space in an attempt to save humanity.',
    release_date: '2014-11-05',
    vote_average: 8.4,
  },
  {
    id: 66732,
    media_type: 'tv',
    name: 'Stranger Things',
    poster_path: '/49WJfeN0moxb9IPfGn8AIqMGskD.jpg',
    backdrop_path: '/56v2KjBlU4XaOv9rVYEQypROD7P.jpg',
    overview: 'A series of supernatural events unfold in a small town.',
    first_air_date: '2016-07-15',
    vote_average: 8.6,
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

const getMockSearch = (q) => {
  const term = String(q || '').trim().toLowerCase()
  const items = term
    ? MOCK_RESULTS.filter((r) => (r.title || r.name || '').toLowerCase().includes(term))
    : MOCK_RESULTS
  return mockPaged(items)
}

module.exports = { getMockTrending, getMockMovies, getMockTv, getMockSearch }
