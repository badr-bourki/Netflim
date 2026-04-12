const express = require('express')
const { z } = require('zod')
const { Progress } = require('../models/Progress')
const { getUserId } = require('../lib/userId')

const router = express.Router()

router.get('/progress', async (req, res, next) => {
  try {
    const userId = getUserId(req)
    const items = await Progress.find({ userId }).sort({ updatedAt: -1 }).lean()
    res.json({ items })
  } catch (err) {
    next(err)
  }
})

router.post('/progress', async (req, res, next) => {
  try {
    const schema = z.object({
      userId: z.string().optional(),
      tmdbId: z.number().int().positive(),
      mediaType: z.enum(['movie', 'tv']),
      progress: z.number().min(0).max(1),
      season: z.number().int().positive().optional(),
      episode: z.number().int().positive().optional(),
    })

    const parsed = schema.parse(req.body)
    const userId = getUserId({ ...req, body: parsed })

    const doc = await Progress.findOneAndUpdate(
      { userId, tmdbId: parsed.tmdbId, mediaType: parsed.mediaType },
      {
        $set: {
          progress: parsed.progress,
          season: parsed.season,
          episode: parsed.episode,
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    ).lean()

    res.json({ ok: true, item: doc })
  } catch (err) {
    next(err)
  }
})

module.exports = { progressRouter: router }
