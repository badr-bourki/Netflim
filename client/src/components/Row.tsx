import type { MediaType, TmdbListResult } from '../types/tmdb'
import { MovieCard } from './MovieCard'
import { useMemo, useRef } from 'react'
import { Link } from 'react-router-dom'

type Props = {
  title: string
  items: TmdbListResult[]
  defaultMediaType: MediaType
  isLoading?: boolean
  exploreHref?: string
}

export function Row({ title, items, defaultMediaType, isLoading, exploreHref }: Props) {
  const scrollerRef = useRef<HTMLDivElement | null>(null)

  const href = useMemo(() => {
    if (exploreHref) return exploreHref
    return defaultMediaType === 'tv' ? '/tv' : '/movies'
  }, [exploreHref, defaultMediaType])

  const scrollByCards = (dir: -1 | 1) => {
    const el = scrollerRef.current
    if (!el) return
    const card = el.querySelector<HTMLElement>('[data-card]')
    const cardW = card ? card.offsetWidth : 180
    el.scrollBy({ left: dir * (cardW * 5), behavior: 'smooth' })
  }

  return (
    <section className="mt-6">
      <div className="flex items-end justify-between px-4 md:px-6">
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        <Link to={href} className="text-sm font-semibold text-white/70 hover:text-white">
          Explore All →
        </Link>
      </div>

      <div className="relative mt-3">
        <button
          type="button"
          className="absolute left-2 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white ring-1 ring-white/10 hover:bg-black/75 md:flex"
          onClick={() => scrollByCards(-1)}
          aria-label={`Scroll ${title} left`}
        >
          ‹
        </button>

        <button
          type="button"
          className="absolute right-2 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white ring-1 ring-white/10 hover:bg-black/75 md:flex"
          onClick={() => scrollByCards(1)}
          aria-label={`Scroll ${title} right`}
        >
          ›
        </button>

        <div
          ref={scrollerRef}
          className="no-scrollbar flex gap-3 overflow-x-auto overflow-y-visible px-4 pb-2 md:px-6"
        >
          {isLoading
            ? Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  className="h-[240px] w-[160px] flex-none rounded netflim-skeleton md:h-[270px] md:w-[180px]"
                />
              ))
            : items.map((m, idx) => (
                <div key={m.id} data-card={idx === 0 ? true : undefined} className="flex-none">
                  <MovieCard item={m} mediaType={(m.media_type as MediaType) || defaultMediaType} />
                </div>
              ))}
        </div>
      </div>
    </section>
  )
}
