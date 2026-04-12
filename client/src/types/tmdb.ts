export type MediaType = 'movie' | 'tv'

export type TmdbListResult = {
  id: number
  media_type?: MediaType
  title?: string
  name?: string
  poster_path: string | null
  backdrop_path: string | null
  overview: string
  release_date?: string
  first_air_date?: string
  vote_average: number
}

export type TmdbPagedResponse<T> = {
  page: number
  results: T[]
  total_pages: number
  total_results: number
}

export type TmdbVideo = {
  id: string
  key: string
  name: string
  site: string
  type: string
}

export type TmdbCast = {
  id: number
  name: string
  character?: string
  profile_path: string | null
}

export type TmdbDetails = {
  id: number
  title?: string
  name?: string
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  release_date?: string
  first_air_date?: string
  vote_average: number
  genres?: Array<{ id: number; name: string }>
  runtime?: number
  episode_run_time?: number[]
  number_of_seasons?: number
  number_of_episodes?: number
  credits?: { cast: TmdbCast[] }
  videos?: { results: TmdbVideo[] }
  similar?: { results: TmdbListResult[] }
  recommendations?: { results: TmdbListResult[] }
}
