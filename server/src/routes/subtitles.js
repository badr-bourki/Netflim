const express = require('express')
const { z } = require('zod')
const { tmdbGet } = require('../lib/tmdb')
const { hasCreds, searchSubtitles, getDownloadLink } = require('../lib/opensubtitles')

const router = express.Router()

const langMap = {
  en: 'en',
  ar: 'ar',
  fr: 'fr',
}

router.get('/subtitles', async (req, res, next) => {
  try {
    const schema = z.object({
      tmdbId: z.string().regex(/^\d+$/),
      type: z.enum(['movie', 'tv']).optional(),
      lang: z.enum(['en', 'ar', 'fr']).default('en'),
    })

    const { tmdbId, type = 'movie', lang } = schema.parse(req.query)

    if (!hasCreds()) {
      return res.json({ items: [], warning: 'OpenSubtitles credentials not configured on server.' })
    }

    const details = await tmdbGet(`/${type}/${tmdbId}`, { language: 'en-US' }, { cache: true })
    const title = type === 'movie' ? details?.title : details?.name
    const date = type === 'movie' ? details?.release_date : details?.first_air_date
    const year = date ? String(date).slice(0, 4) : undefined

    if (!title) {
      return res.json({ items: [] })
    }

    const results = await searchSubtitles({ query: title, year, language: langMap[lang] })

    const items = []
    for (const sub of results.slice(0, 5)) {
      const file = sub?.attributes?.files?.[0]
      const fileId = file?.file_id
      if (!fileId) continue

      const link = await getDownloadLink({ fileId })
      if (!link) continue

      items.push({
        lang,
        fileName: file?.file_name || sub?.attributes?.release || 'subtitle.srt',
        url: link,
      })
    }

    return res.json({ items })
  } catch (err) {
    next(err)
  }
})

module.exports = { subtitlesRouter: router }
