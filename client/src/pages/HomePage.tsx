import { useQuery, useQueries } from '@tanstack/react-query'
import { Hero } from '../components/Hero'
import { Row } from '../components/Row'
import { AdSlot } from '../components/AdSlot'
import { getDetails, getMovies, getTrending, getTv } from '../lib/tmdbApi'
import { fetchMyList, type MyListItem } from '../lib/myList'
import { fetchProgress } from '../lib/progress'
import { useAppStore } from '../stores/appStore'
import { useEngagementStore } from '../stores/engagementStore'
import type { MediaType, TmdbDetails, TmdbListResult } from '../types/tmdb'

function toListResultFromSnapshot(item: MyListItem): TmdbListResult {
  return {
    id: item.tmdbId,
    media_type: item.mediaType,
    title: item.snapshot?.title,
    name: item.snapshot?.title,
    poster_path: item.snapshot?.posterPath || null,
    backdrop_path: item.snapshot?.backdropPath || null,
    overview: item.snapshot?.overview || '',
    release_date: item.snapshot?.releaseDate,
    first_air_date: item.snapshot?.releaseDate,
    vote_average: item.snapshot?.voteAverage || 0,
  }
}

export default function HomePage() {
  const plan = useAppStore((s) => s.subscription.plan)
  const history = useEngagementStore((s) => s.history)
  const likedItems = useEngagementStore((s) => s.likedItems)

  const trending = useQuery({ queryKey: ['trending'], queryFn: getTrending })
  const topRated = useQuery({ queryKey: ['movies', 'top_rated'], queryFn: () => getMovies({ category: 'top_rated' }) })
  const action = useQuery({ queryKey: ['movies', 'genre', '28'], queryFn: () => getMovies({ genre: '28' }) })
  const horror = useQuery({ queryKey: ['movies', 'genre', '27'], queryFn: () => getMovies({ genre: '27' }) })
  const scifi = useQuery({ queryKey: ['movies', 'genre', '878'], queryFn: () => getMovies({ genre: '878' }) })
  const tvPopular = useQuery({ queryKey: ['tv', 'popular'], queryFn: () => getTv({ category: 'popular' }) })
  const anime = useQuery({ queryKey: ['tv', 'genre', '16'], queryFn: () => getTv({ genre: '16' }) })

  const myList = useQuery({ queryKey: ['mylist'], queryFn: fetchMyList })
  const progress = useQuery({ queryKey: ['progress'], queryFn: fetchProgress })

  const continueIds = (progress.data?.items || []).slice(0, 10)

  const continueDetails = useQueries({
    queries: continueIds.map((p) => ({
      queryKey: ['details', p.mediaType, String(p.tmdbId)],
      queryFn: () => getDetails(p.mediaType as MediaType, String(p.tmdbId)),
      enabled: continueIds.length > 0,
    })),
  })

  const continueItems: TmdbListResult[] = continueDetails
    .map((q, idx) => ({ data: q.data, mediaType: continueIds[idx]?.mediaType as MediaType | undefined }))
    .filter((x): x is { data: TmdbDetails; mediaType: MediaType | undefined } => Boolean(x.data))
    .map(({ data, mediaType }) => ({
      id: data.id,
      media_type: mediaType,
      title: data.title,
      name: data.name,
      poster_path: data.poster_path,
      backdrop_path: data.backdrop_path,
      overview: data.overview,
      release_date: data.release_date,
      first_air_date: data.first_air_date,
      vote_average: data.vote_average,
    }))

  return (
    <div>
      <Hero items={(trending.data?.results || []).slice(0, 5)} />

      <div className="pb-12">
        {likedItems.length ? (
          <Row
            title="Liked"
            defaultMediaType="movie"
            items={likedItems.slice(0, 12).map((h) => ({
              id: h.tmdbId,
              media_type: h.mediaType,
              title: h.title,
              name: h.title,
              poster_path: h.posterPath,
              backdrop_path: h.backdropPath,
              overview: '',
              vote_average: 7.8,
            }))}
            exploreHref="/profile"
          />
        ) : null}

        {history.length ? (
          <Row
            title="Recently Watched"
            defaultMediaType="movie"
            items={history.slice(0, 12).map((h) => ({
              id: h.tmdbId,
              media_type: h.mediaType,
              title: h.title,
              name: h.title,
              poster_path: h.posterPath,
              backdrop_path: h.backdropPath,
              overview: '',
              vote_average: 0,
            }))}
            exploreHref="/profile"
          />
        ) : null}

        {myList.data?.items?.length ? (
          <Row
            title="My List"
            defaultMediaType="movie"
            items={myList.data.items.map(toListResultFromSnapshot)}
            exploreHref="/my-list"
          />
        ) : null}

        {continueItems.length ? (
          <Row title="Continue Watching" defaultMediaType="movie" items={continueItems} />
        ) : null}

        <Row
          title="Trending Now"
          defaultMediaType="movie"
          items={trending.data?.results || []}
          isLoading={trending.isLoading}
        />

        {plan === 'free' ? <AdSlot label="Sponsored" /> : null}

        <Row title="Top Rated" defaultMediaType="movie" items={topRated.data?.results || []} isLoading={topRated.isLoading} />
        <Row title="Popular TV" defaultMediaType="tv" items={tvPopular.data?.results || []} isLoading={tvPopular.isLoading} />

        {plan === 'free' ? <AdSlot label="Sponsored" /> : null}

        <Row title="Anime" defaultMediaType="tv" items={anime.data?.results || []} isLoading={anime.isLoading} />
        <Row title="Action" defaultMediaType="movie" items={action.data?.results || []} isLoading={action.isLoading} />
        <Row title="Horror" defaultMediaType="movie" items={horror.data?.results || []} isLoading={horror.isLoading} />
        <Row title="Sci-Fi" defaultMediaType="movie" items={scifi.data?.results || []} isLoading={scifi.isLoading} />
      </div>
    </div>
  )
}
