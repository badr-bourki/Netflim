import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { MediaType, TmdbDetails, TmdbListResult } from '../types/tmdb'
import { tmdbImage } from '../lib/tmdbImage'
import { addToMyList, fetchMyList, removeFromMyList, snapshotFromTmdb } from '../lib/myList'
import { useToastStore } from '../stores/toastStore'
import { getDetails } from '../lib/tmdbApi'
import { useEngagementStore } from '../stores/engagementStore'
import { useAppStore } from '../stores/appStore'

type Props = {
  item: TmdbListResult
  mediaType: MediaType
}

export function MovieCard({ item, mediaType }: Props) {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const pushToast = useToastStore((s) => s.push)
  const plan = useAppStore((s) => s.subscription.plan)
  const toggleLike = useEngagementStore((s) => s.toggleLike)
  const isLiked = useEngagementStore((s) => s.isLiked)

  const [imgOk, setImgOk] = useState(true)
  const [previewOpen, setPreviewOpen] = useState(false)
  const openTimer = useRef<number | null>(null)

  const poster = tmdbImage(item.poster_path, 'w342')
  const backdrop = tmdbImage(item.backdrop_path, 'w780')

  const myListQuery = useQuery({
    queryKey: ['mylist'],
    queryFn: fetchMyList,
  })

  const isInList = useMemo(() => {
    const items = myListQuery.data?.items || []
    return items.some((x) => x.tmdbId === item.id && x.mediaType === mediaType)
  }, [myListQuery.data, item.id, mediaType])

  const toggle = useMutation({
    mutationFn: async () => {
      if (isInList) {
        await removeFromMyList({ tmdbId: item.id, mediaType })
        return { removed: true }
      }
      await addToMyList({ tmdbId: item.id, mediaType, snapshot: snapshotFromTmdb(item) })
      return { removed: false }
    },
    onSuccess: (r) => {
      qc.invalidateQueries({ queryKey: ['mylist'] })
      pushToast(r.removed ? 'Removed from My List' : 'Added to My List')
    },
    onError: () => {
      pushToast('Could not update My List (DB not connected?)')
    },
  })

  const title = item.title || item.name || 'Untitled'
  const year = (item.release_date || item.first_air_date || '').slice(0, 4)

  const match = useMemo(() => {
    const base = Math.round(item.vote_average * 10)
    return Math.max(72, Math.min(99, base))
  }, [item.vote_average])

  const details = useQuery<TmdbDetails>({
    queryKey: ['card-details', mediaType, String(item.id)],
    queryFn: () => getDetails(mediaType, String(item.id)),
    enabled: previewOpen,
    staleTime: 10 * 60_000,
  })

  const tags = useMemo(() => {
    const g = details.data?.genres || []
    return g.slice(0, 2).map((x) => x.name).join(' • ')
  }, [details.data?.genres])

  const durationText = useMemo(() => {
    const d = details.data
    const minutes = d?.runtime || d?.episode_run_time?.[0]
    if (!minutes || minutes <= 0) return '—'
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    return h > 0 ? `${h}h ${m}m` : `${m}m`
  }, [details.data])

  useEffect(() => {
    return () => {
      if (openTimer.current) window.clearTimeout(openTimer.current)
      openTimer.current = null
    }
  }, [])

  const onEnter = () => {
    if (openTimer.current) window.clearTimeout(openTimer.current)
    openTimer.current = window.setTimeout(() => setPreviewOpen(true), 300)
  }

  const onLeave = () => {
    if (openTimer.current) window.clearTimeout(openTimer.current)
    openTimer.current = null
    setPreviewOpen(false)
  }

  return (
    <div className="relative w-[160px] flex-none md:w-[180px]" onMouseEnter={onEnter} onMouseLeave={onLeave}>
      <button
        type="button"
        onClick={() => navigate(`/details/${mediaType}/${item.id}`)}
        className="block w-full overflow-hidden rounded bg-white/5 ring-1 ring-white/10 transition hover:ring-white/15"
        aria-label={`Open details for ${title}`}
      >
        {poster && imgOk ? (
          <img
            src={poster}
            alt={title}
            loading="lazy"
            decoding="async"
            className="h-[240px] w-full object-cover md:h-[270px]"
            onError={() => setImgOk(false)}
          />
        ) : (
          <div className="h-[240px] w-full bg-white/10 md:h-[270px]" />
        )}
      </button>

      {previewOpen ? (
        <div className="pointer-events-none absolute left-0 top-0 z-30 w-full origin-top transition-transform duration-200">
          <div className="pointer-events-auto origin-top scale-[1.25]">
            <div className="overflow-hidden rounded bg-netflim-bg ring-1 ring-white/15 shadow-2xl shadow-black/60">
              <div className="relative h-[110px] bg-black">
                {backdrop ? (
                  <img src={backdrop} alt="" className="h-full w-full object-cover" loading="lazy" decoding="async" />
                ) : null}
                <div className="absolute inset-0 bg-gradient-to-t from-netflim-bg via-black/20 to-transparent" />
                <div className="absolute left-2 top-2 flex items-center gap-2">
                  {plan === 'pro' ? (
                    <div className="rounded bg-white/10 px-2 py-1 text-[10px] font-bold uppercase text-white ring-1 ring-white/15">
                      PRO
                    </div>
                  ) : null}
                  {item.vote_average >= 8.2 ? (
                    <div className="rounded bg-netflim-red px-2 py-1 text-[10px] font-bold uppercase text-white">
                      Exclusive
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="p-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="netflim-btn-primary h-9 px-3"
                    onClick={() => navigate(`/watch/${mediaType}/${item.id}`)}
                  >
                    ▶ Play
                  </button>

                  <button
                    type="button"
                    className="inline-flex h-9 w-9 items-center justify-center rounded border border-white/15 bg-black/40 text-sm text-white hover:bg-black/60"
                    onClick={() => toggle.mutate()}
                    disabled={toggle.isPending}
                    aria-label={isInList ? 'Remove from My List' : 'Add to My List'}
                  >
                    {isInList ? '−' : '+'}
                  </button>

                  <button
                    type="button"
                    className={
                      'inline-flex h-9 w-9 items-center justify-center rounded border border-white/15 bg-black/40 text-sm text-white hover:bg-black/60 ' +
                      (isLiked({ tmdbId: item.id, mediaType }) ? 'ring-1 ring-white/25' : '')
                    }
                    onClick={() => {
                      const nowLiked = toggleLike({
                        tmdbId: item.id,
                        mediaType,
                        meta: {
                          title,
                          posterPath: item.poster_path,
                          backdropPath: item.backdrop_path,
                        },
                      })
                      pushToast(nowLiked ? 'Saved to Likes' : 'Removed from Likes', nowLiked ? 'success' : 'info')
                    }}
                    aria-label="Like"
                  >
                    👍
                  </button>

                  <button
                    type="button"
                    className="ml-auto inline-flex h-9 w-9 items-center justify-center rounded border border-white/15 bg-black/40 text-sm text-white hover:bg-black/60"
                    onClick={() => navigate(`/details/${mediaType}/${item.id}`)}
                    aria-label="Details"
                  >
                    ⌄
                  </button>
                </div>

                <div className="mt-3">
                  <div className="truncate text-sm font-semibold text-white">{title}</div>
                  <div className="mt-1 flex items-center gap-2 text-xs text-white/70">
                    <span className="font-semibold text-green-500">{match}% Match</span>
                    <span>•</span>
                    <span>{durationText}</span>
                    <span>•</span>
                    <span>{year ? year : '—'}</span>
                    {plan === 'pro' ? (
                      <span className="ml-auto rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-bold text-white">HD</span>
                    ) : null}
                  </div>

                  {details.isLoading ? (
                    <div className="mt-2 h-3 w-40 rounded netflim-skeleton" />
                  ) : tags ? (
                    <div className="mt-2 text-xs text-white/70">{tags}</div>
                  ) : null}

                  <div className="mt-2 max-h-[2.5rem] overflow-hidden text-xs leading-5 text-white/65">
                    {details.data?.overview || item.overview}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
