const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')

const { env } = require('./config/env')
const { httpsOnly } = require('./middlewares/httpsOnly')
const { apiRateLimit } = require('./middlewares/rateLimit')
const { errorHandler } = require('./middlewares/errorHandler')
const { requireDb } = require('./middlewares/requireDb')

const { tmdbRouter } = require('./routes/tmdb')
const { subtitlesRouter } = require('./routes/subtitles')
const { myListRouter } = require('./routes/mylist')
const { progressRouter } = require('./routes/progress')

const createApp = () => {
  const app = express()

  app.set('trust proxy', 1)

  app.use(httpsOnly)
  app.use(helmet())
  app.use(
    cors({
      origin: (origin, cb) => {
        if (!origin) return cb(null, true)
        const allowed = String(env.CORS_ORIGIN || '')
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
        if (allowed.length === 0) return cb(null, true)
        if (allowed.includes('*')) return cb(null, true)
        if (allowed.includes(origin)) return cb(null, true)
        return cb(new Error('CORS blocked'), false)
      },
      credentials: false,
    }),
  )
  app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'))
  app.use(express.json({ limit: '1mb' }))

  app.get('/health', (req, res) => res.json({ ok: true }))

  app.use('/api', apiRateLimit)
  app.use('/api', tmdbRouter)
  app.use('/api', subtitlesRouter)
  app.use('/api', requireDb, myListRouter)
  app.use('/api', requireDb, progressRouter)

  app.use(errorHandler)

  return app
}

module.exports = { createApp }
