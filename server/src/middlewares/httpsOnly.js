const httpsOnly = (req, res, next) => {
  // In production behind a proxy (Render/Railway), trust x-forwarded-proto
  if (process.env.NODE_ENV === 'production') {
    const proto = req.headers['x-forwarded-proto']
    if (proto && proto !== 'https') {
      return res.status(403).json({ error: 'HTTPS required' })
    }
  }
  return next()
}

module.exports = { httpsOnly }
