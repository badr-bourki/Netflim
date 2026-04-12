import { apiGet } from './api'
import type { TmdbDetails, TmdbListResult, TmdbPagedResponse } from '../types/tmdb'

export function getTrending() {
  return apiGet<TmdbPagedResponse<TmdbListResult>>('/api/trending')
}

export function getMovies(params: { page?: number; category?: string; genre?: string } = {}) {
  const sp = new URLSearchParams()
  if (params.page) sp.set('page', String(params.page))
  if (params.category) sp.set('category', params.category)
  if (params.genre) sp.set('genre', params.genre)
  return apiGet<TmdbPagedResponse<TmdbListResult>>(`/api/movies?${sp.toString()}`)
}

export function getTv(params: { page?: number; category?: string; genre?: string } = {}) {
  const sp = new URLSearchParams()
  if (params.page) sp.set('page', String(params.page))
  if (params.category) sp.set('category', params.category)
  if (params.genre) sp.set('genre', params.genre)
  return apiGet<TmdbPagedResponse<TmdbListResult>>(`/api/tv?${sp.toString()}`)
}

export function getDetails(type: 'movie' | 'tv', id: string) {
  return apiGet<TmdbDetails>(`/api/details/${type}/${id}`)
}

export function searchMulti(q: string, page?: number) {
  const sp = new URLSearchParams({ q })
  if (page) sp.set('page', String(page))
  return apiGet<TmdbPagedResponse<TmdbListResult>>(`/api/search?${sp.toString()}`)
}
