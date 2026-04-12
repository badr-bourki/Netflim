import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { MediaType } from '../types/tmdb'

export type HistoryItem = {
  tmdbId: number
  mediaType: MediaType
  title: string
  posterPath: string | null
  backdropPath: string | null
  watchedAt: number
}

export type LikedItem = {
  tmdbId: number
  mediaType: MediaType
  title: string
  posterPath: string | null
  backdropPath: string | null
  likedAt: number
}

type EngagementState = {
  likes: Record<string, true>
  toggleLike: (p: {
    tmdbId: number
    mediaType: MediaType
    meta?: { title: string; posterPath: string | null; backdropPath: string | null }
  }) => boolean
  isLiked: (p: { tmdbId: number; mediaType: MediaType }) => boolean

  likedItems: LikedItem[]

  history: HistoryItem[]
  pushHistory: (item: Omit<HistoryItem, 'watchedAt'>) => void
}

const keyOf = (tmdbId: number, mediaType: MediaType) => `${mediaType}:${tmdbId}`

export const useEngagementStore = create<EngagementState>()(
  persist(
    (set, get) => ({
      likes: {},
      likedItems: [],

      toggleLike: ({ tmdbId, mediaType, meta }) => {
        const k = keyOf(tmdbId, mediaType)
        const currentlyLiked = Boolean(get().likes[k])

        set((s) => {
          const nextLikes = { ...s.likes }
          const nextLikedItems = s.likedItems.filter((x) => keyOf(x.tmdbId, x.mediaType) !== k)

          if (currentlyLiked) {
            delete nextLikes[k]
            return { likes: nextLikes, likedItems: nextLikedItems }
          }

          nextLikes[k] = true
          if (meta) {
            nextLikedItems.unshift({
              tmdbId,
              mediaType,
              title: meta.title,
              posterPath: meta.posterPath,
              backdropPath: meta.backdropPath,
              likedAt: Date.now(),
            })
          }

          return { likes: nextLikes, likedItems: nextLikedItems.slice(0, 50) }
        })

        return !currentlyLiked
      },
      isLiked: ({ tmdbId, mediaType }) => Boolean(get().likes[keyOf(tmdbId, mediaType)]),

      history: [],
      pushHistory: (item) => {
        const watchedAt = Date.now()
        const k = keyOf(item.tmdbId, item.mediaType)
        set((s) => {
          const filtered = s.history.filter((h) => keyOf(h.tmdbId, h.mediaType) !== k)
          return { history: [{ ...item, watchedAt }, ...filtered].slice(0, 30) }
        })
      },
    }),
    { name: 'netflim:engagement' },
  ),
)
