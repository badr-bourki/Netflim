const IMAGE_BASE = 'https://image.tmdb.org/t/p'

export function tmdbImage(path: string | null | undefined, size: 'w342' | 'w500' | 'w780' | 'original' = 'w500'): string | null {
  if (!path) return null
  return `${IMAGE_BASE}/${size}${path}`
}
