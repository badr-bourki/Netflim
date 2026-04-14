const mongoose = require('mongoose')

const requireDb = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    // Local development fallback when MongoDB is not configured.
    if (req.method === 'GET' && req.path === '/mylist') {
      return res.json({ items: [] })
    }

    if (req.method === 'GET' && req.path === '/progress') {
      return res.json({ items: [] })
    }

    if (req.method === 'POST' && (req.path === '/mylist' || req.path === '/progress')) {
      return res.json({ ok: true, persisted: false })
    }

    return res.status(503).json({ error: 'Database not connected' })
  }
  return next()
}

module.exports = { requireDb }
