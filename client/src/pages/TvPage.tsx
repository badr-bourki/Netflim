import { useInfiniteQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { getTv } from '../lib/tmdbApi'
import { MovieCard } from '../components/MovieCard'
import type { MediaType } from '../types/tmdb'

const genres = [
  { id: '', name: 'All Genres' },
  { id: '16', name: 'Animation / Anime' },
  { id: '10759', name: 'Action & Adventure' },
  { id: '80', name: 'Crime' },
  { id: '10765', name: 'Sci-Fi & Fantasy' },
]

export default function TvPage() {
  const [genre, setGenre] = useState('')

  const query = useInfiniteQuery({
    queryKey: ['tv', 'infinite', { genre }],
    initialPageParam: 1,
    queryFn: ({ pageParam }) => getTv({ page: pageParam as number, genre: genre || undefined }),
    getNextPageParam: (last) => (last.page < Math.min(last.total_pages, 20) ? last.page + 1 : undefined),
  })

  const items = useMemo(() => query.data?.pages.flatMap((p) => p.results) || [], [query.data])

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">TV</h1>
          <p className="mt-1 text-sm text-white/70">Genre filters with paged results.</p>
        </div>

        <label className="flex items-center gap-3 text-sm text-white/80">
          Genre
          <select
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            className="h-10 rounded border border-white/15 bg-black/30 px-3 text-white"
          >
            {genres.map((g) => (
              <option key={g.id || 'all'} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6">
        {query.isLoading
          ? Array.from({ length: 18 }).map((_, i) => (
              <div key={i} className="h-[240px] rounded netflim-skeleton md:h-[270px]" />
            ))
          : items.map((m) => <MovieCard key={`${m.id}`} item={m} mediaType={'tv' as MediaType} />)}
      </div>

      <div className="mt-8 flex justify-center">
        {query.hasNextPage ? (
          <button
            type="button"
            onClick={() => query.fetchNextPage()}
            disabled={query.isFetchingNextPage}
            className="netflim-btn-secondary disabled:opacity-50"
          >
            {query.isFetchingNextPage ? 'Loading…' : 'Load More'}
          </button>
        ) : (
          <div className="text-sm text-white/60">End of results</div>
        )}
      </div>

      {query.isError ? <div className="mt-6 text-sm text-netflim-red">Failed to load TV.</div> : null}
    </div>
  )
}
