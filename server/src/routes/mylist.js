const express = require('express')
const { z } = require('zod')
const { MyListItem } = require('../models/MyListItem')
const { getUserId } = require('../lib/userId')

const router = express.Router()

router.get('/mylist', async (req, res, next) => {
  try {
    const userId = getUserId(req)
    const items = await MyListItem.find({ userId }).sort({ createdAt: -1 }).lean()
    res.json({ items })
  } catch (err) {
    next(err)
  }
})

router.post('/mylist', async (req, res, next) => {
  try {
    const schema = z.object({
      userId: z.string().optional(),
      action: z.enum(['add', 'remove']),
      tmdbId: z.number().int().positive(),
      mediaType: z.enum(['movie', 'tv']),
      snapshot: z
        .object({
          title: z.string().optional(),
          posterPath: z.string().optional(),
          backdropPath: z.string().optional(),
          overview: z.string().optional(),
          releaseDate: z.string().optional(),
          voteAverage: z.number().optional(),
        })
        .optional(),
    })

    const parsed = schema.parse(req.body)
    const userId = getUserId({ ...req, body: parsed })

    if (parsed.action === 'remove') {
      await MyListItem.deleteOne({ userId, tmdbId: parsed.tmdbId, mediaType: parsed.mediaType })
      return res.json({ ok: true })
    }

    const doc = await MyListItem.findOneAndUpdate(
      { userId, tmdbId: parsed.tmdbId, mediaType: parsed.mediaType },
      { $set: { snapshot: parsed.snapshot || {} } },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    ).lean()

    return res.json({ ok: true, item: doc })
  } catch (err) {
    // Duplicate key upsert can race under concurrent clicks; treat as ok.
    if (err?.code === 11000) return res.json({ ok: true })
    next(err)
  }
})

module.exports = { myListRouter: router }
