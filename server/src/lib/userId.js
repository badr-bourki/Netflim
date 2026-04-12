const { z } = require('zod')

const userIdSchema = z.string().min(8).max(80)

const getUserId = (req) => {
  const candidate = req.headers['x-user-id'] || req.query.userId || req.body?.userId
  return userIdSchema.parse(candidate)
}

module.exports = { getUserId, userIdSchema }
