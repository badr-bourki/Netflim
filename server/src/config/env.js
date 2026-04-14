const required = (value, name) => {
  if (!value) {
    throw new Error(`Missing required env var: ${name}`)
  }
  return value
}

const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: Number(process.env.PORT || 5000),

  TMDB_API_KEY: process.env.TMDB_API_KEY || '',
  TMDB_BASE_URL: process.env.TMDB_BASE_URL || 'https://api.themoviedb.org/3',

  MONGODB_URI: process.env.MONGODB_URI || '',

  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',

  OPEN_SUBTITLES_API_KEY: process.env.OPEN_SUBTITLES_API_KEY || '',
  OPEN_SUBTITLES_USERNAME: process.env.OPEN_SUBTITLES_USERNAME || '',
  OPEN_SUBTITLES_PASSWORD: process.env.OPEN_SUBTITLES_PASSWORD || '',

  DEBUG_TMDB: process.env.DEBUG_TMDB || '',
}

const assertEnv = () => {
  // TMDB key, DB and subtitles creds are optional for boot.
  // Routes can degrade gracefully with local mock data in development.
}

module.exports = { env, assertEnv }
