import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { TmdbListResult } from '../types/tmdb'
import { tmdbImage } from '../lib/tmdbImage'
import { addToMyList, fetchMyList, removeFromMyList, snapshotFromTmdb } from '../lib/myList'
import { useToastStore } from '../stores/toastStore'

type Props = {
  item?: TmdbListResult
  items?: TmdbListResult[]
}

export function Hero({ item, items }: Props) {
  const navigate = useNavigate()
  const [now] = useState(() => Date.now())

  const pushToast = useToastStore((s) => s.push)
  const qc = useQueryClient()

  const slideItems = useMemo(() => {
    const src = (items && items.length ? items : item ? [item] : []).filter(Boolean)
    return src.slice(0, 5)
  }, [items, item])

  const [active, setActive] = useState(0)
  const activeItem = slideItems[active] || slideItems[0]
  const activeType = (activeItem?.media_type as 'movie' | 'tv' | undefined) || 'movie'

  useEffect(() => {
    if (slideItems.length <= 1) return
    const id = window.setInterval(() => {
      setActive((i) => (i + 1) % slideItems.length)
    }, 6500)
    return () => window.clearInterval(id)
  }, [slideItems.length])

  const myListQuery = useQuery({ queryKey: ['mylist'], queryFn: fetchMyList })
  const isInList = useMemo(() => {
    const items = myListQuery.data?.items || []
    if (!activeItem) return false
    return items.some((x) => x.tmdbId === activeItem.id && x.mediaType === activeType)
  }, [myListQuery.data, activeItem, activeType])

  const toggle = useMutation({
    mutationFn: async () => {
      if (!activeItem) return { removed: false }
      if (isInList) {
        await removeFromMyList({ tmdbId: activeItem.id, mediaType: activeType })
        return { removed: true }
      }
      await addToMyList({ tmdbId: activeItem.id, mediaType: activeType, snapshot: snapshotFromTmdb(activeItem) })
      return { removed: false }
    },
    onSuccess: (r) => {
      qc.invalidateQueries({ queryKey: ['mylist'] })
      pushToast(r.removed ? 'Removed from My List' : 'Added to My List')
    },
    onError: () => pushToast('Could not update My List (DB not connected?)'),
  })

  const title = activeItem?.title || activeItem?.name || 'NETFLIM'
  const overview = activeItem?.overview || 'Browse trending titles, watch instantly, and keep your list synced.'

  const backdrop = tmdbImage(activeItem?.backdrop_path, 'original')

  const badge = useMemo(() => {
    const date = (activeItem?.release_date || activeItem?.first_air_date || '').slice(0, 10)
    if (!date) return 'Top 10'
    const d = new Date(date)
    if (Number.isNaN(d.getTime())) return 'Top 10'
    const days = (now - d.getTime()) / (1000 * 60 * 60 * 24)
    return days <= 90 ? 'New' : 'Top 10'
  }, [activeItem?.release_date, activeItem?.first_air_date, now])

  return (
    <section className="relative">
      <div className="relative h-[62vh] min-h-[420px] w-full">
        {slideItems.length ? (
          <div className="absolute inset-0">
            {slideItems.map((s, idx) => {
              const src = tmdbImage(s.backdrop_path, 'original')
              const isActive = idx === active

              return (
                <div
                  key={s.id}
                  className={
                    'absolute inset-0 transition-opacity duration-700 ' +
                    (isActive ? 'opacity-100' : 'opacity-0')
                  }
                >
                  {src ? (
                    <img
                      src={src}
                      alt=""
                      className={
                        'h-full w-full object-cover ' +
                        (isActive ? 'netflim-kenburns' : '')
                      }
                      loading={isActive ? 'eager' : 'lazy'}
                      decoding="async"
                    />
                  ) : (
                    <div className="h-full w-full bg-black" />
                  )}
                </div>
              )
            })}
          </div>
        ) : backdrop ? (
          <img src={backdrop} alt="" className="absolute inset-0 h-full w-full object-cover" loading="eager" />
        ) : (
          <div className="absolute inset-0 bg-black" />
        )}

        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-netflim-bg via-transparent to-transparent" />

        <div className="mx-auto flex h-full max-w-7xl items-end px-4 pb-10 md:px-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2">
              <div className="rounded bg-netflim-red px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
                {badge}
              </div>
              {slideItems.length ? (
                <div className="text-[11px] font-semibold text-white/70">Trending</div>
              ) : null}
            </div>

            <div className="mt-3 text-4xl font-extrabold tracking-tight text-white md:text-5xl">{title}</div>
            <p className="mt-3 max-h-[4.5rem] overflow-hidden text-sm leading-6 text-white/80 md:text-base">
              {overview}
            </p>

            <div className="mt-6 flex items-center gap-3">
              <button
                type="button"
                className="netflim-btn-primary h-11 px-5"
                onClick={() => activeItem && navigate(`/watch/${activeType}/${activeItem.id}`)}
                disabled={!activeItem}
              >
                ▶ Play
              </button>
              <button
                type="button"
                className="netflim-btn-secondary h-11 px-5"
                onClick={() => activeItem && toggle.mutate()}
                disabled={!activeItem || toggle.isPending}
              >
                {isInList ? '✓ My List' : '+ My List'}
              </button>

              <button
                type="button"
                className="hidden h-11 rounded bg-white/10 px-5 text-sm font-semibold text-white hover:bg-white/15 md:inline-flex"
                onClick={() => activeItem && navigate(`/details/${activeType}/${activeItem.id}`)}
                disabled={!activeItem}
              >
                More Info
              </button>
            </div>

            {slideItems.length > 1 ? (
              <div className="mt-6 flex items-center gap-2">
                {slideItems.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={
                      'h-2 w-2 rounded-full transition ' +
                      (idx === active ? 'bg-white' : 'bg-white/35 hover:bg-white/60')
                    }
                    onClick={() => setActive(idx)}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  )
}
