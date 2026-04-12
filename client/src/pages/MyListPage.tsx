import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchMyList, type MyListItem } from '../lib/myList'
import type { MediaType, TmdbListResult } from '../types/tmdb'
import { MovieCard } from '../components/MovieCard'
import { Link } from 'react-router-dom'

function toListResult(item: MyListItem): { mediaType: MediaType; result: TmdbListResult } {
  const mediaType = (item.mediaType as MediaType) || 'movie'
  return {
    mediaType,
    result: {
      id: item.tmdbId,
      media_type: mediaType,
      title: item.snapshot?.title,
      name: item.snapshot?.title,
      poster_path: item.snapshot?.posterPath || null,
      backdrop_path: item.snapshot?.backdropPath || null,
      overview: item.snapshot?.overview || '',
      release_date: item.snapshot?.releaseDate,
      first_air_date: item.snapshot?.releaseDate,
      vote_average: item.snapshot?.voteAverage || 0,
    },
  }
}

export default function MyListPage() {
  const myList = useQuery({ queryKey: ['mylist'], queryFn: fetchMyList })

  const items = useMemo(() => {
    const raw = myList.data?.items || []
    return raw.map(toListResult)
  }, [myList.data])

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">My List</h1>
        <p className="mt-1 text-sm text-white/70">Saved titles synced in the database.</p>
      </div>

      {myList.isError ? (
        <div className="mt-6 rounded bg-white/5 p-4 text-sm text-white/70 ring-1 ring-white/10">
          Could not load My List. The database might be offline.
        </div>
      ) : null}

      {myList.isLoading ? (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="h-[240px] rounded netflim-skeleton md:h-[270px]" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="mt-6 rounded bg-white/5 p-6 ring-1 ring-white/10">
          <div className="text-lg font-semibold text-white">Your list is empty</div>
          <div className="mt-2 text-sm text-white/60">Add titles to keep track of what you want to watch.</div>
          <Link to="/" className="netflim-btn-primary mt-5 inline-flex">
            Browse trending
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6">
          {items.map(({ mediaType, result }) => (
            <MovieCard key={`${mediaType}-${result.id}`} item={result} mediaType={mediaType} />
          ))}
        </div>
      )}
    </div>
  )
}
