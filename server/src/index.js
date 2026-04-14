require('dotenv').config()

const mongoose = require('mongoose')
const { createApp } = require('./app')
const { env, assertEnv } = require('./config/env')

let httpServer

const start = async () => {
  assertEnv()

  if (!env.TMDB_API_KEY) {
    // eslint-disable-next-line no-console
    console.warn('TMDB_API_KEY not set: /api/trending,/movies,/tv,/search will use mock fallback data.')
  }

  if (env.MONGODB_URI) {
    await mongoose.connect(env.MONGODB_URI)
  } else {
    // eslint-disable-next-line no-console
    console.warn('MONGODB_URI not set: My List / Progress will not persist.')
  }

  const app = createApp()

  httpServer = app.listen(env.PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`NETFLIM API running on :${env.PORT}`)
  })

  httpServer.on('error', (err) => {
    // eslint-disable-next-line no-console
    console.error('HTTP server failed to start:', err)
    process.exit(1)
  })
}

start().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err)
  process.exit(1)
})
