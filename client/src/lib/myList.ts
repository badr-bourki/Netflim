import { apiGet, apiPost } from './api'
import type { MediaType, TmdbListResult } from '../types/tmdb'

export type MyListItem = {
  _id: string
  userId: string
  tmdbId: number
  mediaType: MediaType
  snapshot?: {
    title?: string
    posterPath?: string
    backdropPath?: string
    overview?: string
    releaseDate?: string
    voteAverage?: number
  }
  createdAt: string
  updatedAt: string
}

export async function fetchMyList(): Promise<{ items: MyListItem[] }> {
  return apiGet('/api/mylist')
}

export async function addToMyList(item: { tmdbId: number; mediaType: MediaType; snapshot?: Partial<MyListItem['snapshot']> }) {
  return apiPost('/api/mylist', { action: 'add', ...item })
}

export async function removeFromMyList(item: { tmdbId: number; mediaType: MediaType }) {
  return apiPost('/api/mylist', { action: 'remove', ...item })
}

export function snapshotFromTmdb(r: TmdbListResult) {
  return {
    title: r.title || r.name,
    posterPath: r.poster_path ?? undefined,
    backdropPath: r.backdrop_path ?? undefined,
    overview: r.overview,
    releaseDate: r.release_date || r.first_air_date,
    voteAverage: r.vote_average,
  }
}
