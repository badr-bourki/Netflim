import { useEffect, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useDebouncedValue } from '../lib/useDebouncedValue'
import { searchMulti } from '../lib/tmdbApi'
import { useRecentSearchesStore } from '../stores/recentSearchesStore'
import { useAppStore } from '../stores/appStore'
import { MovieCard } from '../components/MovieCard'
import type { MediaType } from '../types/tmdb'

export default function SearchPage() {
  const q = useAppStore((s) => s.searchQuery)
  const setQ = useAppStore((s) => s.setSearchQuery)
  const debounced = useDebouncedValue(q, 400)

  const addRecent = useRecentSearchesStore((s) => s.add)
  const recent = useRecentSearchesStore((s) => s.recent)
  const clear = useRecentSearchesStore((s) => s.clear)

  const query = useQuery({
    queryKey: ['search', debounced],
    queryFn: () => searchMulti(debounced),
    enabled: debounced.trim().length > 0,
  })

  const results = useMemo(() => (query.data?.results || []).filter((r) => r.media_type === 'movie' || r.media_type === 'tv'), [query.data])

  useEffect(() => {
    if (query.isSuccess && debounced.trim().length > 0) {
      addRecent(debounced)
    }
  }, [addRecent, debounced, query.isSuccess])

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      <h1 className="text-2xl font-semibold text-white">Search</h1>
      <div className="mt-4">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search movies, TV…"
          className="h-12 w-full rounded border border-white/15 bg-black/30 px-4 text-white placeholder:text-white/40"
        />
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {recent.length ? (
            <>
              <div className="text-xs text-white/60">Recent:</div>
              {recent.map((r) => (
                <button
                  key={r}
                  type="button"
                  className="rounded bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/80 transition-transform active:scale-[0.98] hover:bg-white/15"
                  onClick={() => setQ(r)}
                >
                  {r}
                </button>
              ))}
              <button
                type="button"
                className="rounded px-2 py-1 text-xs text-white/60 hover:text-white"
                onClick={clear}
              >
                Clear
              </button>
            </>
          ) : (
            <div className="text-xs text-white/60">Type to search (debounced 400ms)</div>
          )}
        </div>
      </div>

      {debounced.trim().length > 0 ? (
        <div className="mt-6">
          {query.isLoading ? <div className="text-sm text-white/70">Searching…</div> : null}
          {query.isError ? <div className="text-sm text-netflim-red">Search failed.</div> : null}

          {!query.isLoading && results.length === 0 ? (
            <div className="rounded bg-white/5 p-4 text-sm text-white/60 ring-1 ring-white/10">No results.</div>
          ) : null}

          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6">
            {results.map((m) => (
              <MovieCard
                key={`${m.media_type}-${m.id}`}
                item={m}
                mediaType={(m.media_type as MediaType) || 'movie'}
              />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}
