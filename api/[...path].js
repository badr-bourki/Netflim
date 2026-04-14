const mongoose = require('mongoose')
const { createApp } = require('../server/src/app')
const { env } = require('../server/src/config/env')

let app
let dbConnectPromise

const ensureDbConnection = async () => {
  if (!env.MONGODB_URI) return
  if (mongoose.connection.readyState === 1) return

  if (!dbConnectPromise) {
    dbConnectPromise = mongoose.connect(env.MONGODB_URI).catch((err) => {
      dbConnectPromise = undefined
      throw err
    })
  }

  await dbConnectPromise
}

module.exports = async (req, res) => {
  if (!app) {
    app = createApp()
  }

  try {
    await ensureDbConnection()
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('MongoDB connection failed in serverless runtime:', err?.message || err)
  }

  return app(req, res)
}
