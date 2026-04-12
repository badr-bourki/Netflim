import { apiGet, apiPost } from './api'
import type { MediaType } from '../types/tmdb'

export type ProgressItem = {
  _id: string
  userId: string
  tmdbId: number
  mediaType: MediaType
  progress: number
  season?: number
  episode?: number
  createdAt: string
  updatedAt: string
}

export async function fetchProgress(): Promise<{ items: ProgressItem[] }> {
  return apiGet('/api/progress')
}

export async function saveProgress(payload: {
  tmdbId: number
  mediaType: MediaType
  progress: number
  season?: number
  episode?: number
}) {
  return apiPost('/api/progress', payload)
}
