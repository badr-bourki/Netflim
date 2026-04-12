const mongoose = require('mongoose')

const requireDb = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ error: 'Database not connected' })
  }
  return next()
}

module.exports = { requireDb }
