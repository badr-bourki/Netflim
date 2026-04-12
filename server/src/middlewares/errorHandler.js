// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  const status = Number(err?.status || 500)
  const message = err?.message || 'Server error'

  if (process.env.NODE_ENV !== 'production') {
    // Useful for local debugging without leaking details in prod
    // eslint-disable-next-line no-console
    console.error(err)
  }

  res.status(status).json({ error: message })
}

module.exports = { errorHandler }
