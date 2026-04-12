const axios = require('axios')
const { env } = require('../config/env')

const BASE_URL = 'https://api.opensubtitles.com/api/v1'

let tokenCache = {
  token: null,
  expiresAt: 0,
}

const hasCreds = () => Boolean(env.OPEN_SUBTITLES_API_KEY && env.OPEN_SUBTITLES_USERNAME && env.OPEN_SUBTITLES_PASSWORD)

const getAuthToken = async () => {
  if (!hasCreds()) return null
  const now = Date.now()
  if (tokenCache.token && tokenCache.expiresAt > now + 60_000) {
    return tokenCache.token
  }

  const res = await axios.post(
    `${BASE_URL}/login`,
    {
      username: env.OPEN_SUBTITLES_USERNAME,
      password: env.OPEN_SUBTITLES_PASSWORD,
    },
    {
      headers: {
        'Api-Key': env.OPEN_SUBTITLES_API_KEY,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      timeout: 10_000,
    },
  )

  const token = res?.data?.token
  if (!token) return null

  // OpenSubtitles tokens are long-lived; set a conservative 12h expiry
  tokenCache = { token, expiresAt: now + 12 * 60 * 60 * 1000 }
  return token
}

const searchSubtitles = async ({ query, year, language }) => {
  const token = await getAuthToken()
  if (!token) return []

  const res = await axios.get(`${BASE_URL}/subtitles`, {
    params: {
      query,
      year,
      languages: language,
      order_by: 'download_count',
      order_direction: 'desc',
    },
    headers: {
      'Api-Key': env.OPEN_SUBTITLES_API_KEY,
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
    timeout: 10_000,
  })

  const data = res?.data?.data || []
  return data
}

const getDownloadLink = async ({ fileId }) => {
  const token = await getAuthToken()
  if (!token) return null

  const res = await axios.post(
    `${BASE_URL}/download`,
    { file_id: fileId },
    {
      headers: {
        'Api-Key': env.OPEN_SUBTITLES_API_KEY,
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      timeout: 10_000,
    },
  )

  return res?.data?.link || null
}

module.exports = { hasCreds, searchSubtitles, getDownloadLink }
