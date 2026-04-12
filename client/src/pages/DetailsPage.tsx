import { useMemo } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getDetails } from '../lib/tmdbApi'
import { tmdbImage } from '../lib/tmdbImage'
import { Row } from '../components/Row'
import type { MediaType, TmdbListResult } from '../types/tmdb'

export default function DetailsPage() {
  const params = useParams()
  const navigate = useNavigate()
  const type = (params.type as MediaType) || 'movie'
  const id = params.id || ''

  const details = useQuery({
    queryKey: ['details', type, id],
    queryFn: () => getDetails(type, id),
    enabled: Boolean(id) && (type === 'movie' || type === 'tv'),
  })

  const d = details.data
  const title = d?.title || d?.name || 'Title'
  const backdrop = tmdbImage(d?.backdrop_path, 'original')
  const poster = tmdbImage(d?.poster_path, 'w500')

  const trailer = useMemo(() => {
    const vids = d?.videos?.results || []
    return vids.find((v) => v.site === 'YouTube' && v.type === 'Trailer') || vids[0]
  }, [d?.videos?.results])

  const similar: TmdbListResult[] = useMemo(() => {
    return (d?.similar?.results || []).map((x) => ({ ...x, media_type: type }))
  }, [d?.similar?.results, type])

  const cast = (d?.credits?.cast || []).slice(0, 14)

  if (details.isLoading) {
    return <div className="mx-auto max-w-7xl px-4 py-10 text-white/70 md:px-6">Loading…</div>
  }

  if (details.isError || !d) {
    return <div className="mx-auto max-w-7xl px-4 py-10 text-netflim-red md:px-6">Failed to load details.</div>
  }

  return (
    <div>
      <section className="relative">
        <div className="relative h-[62vh] min-h-[420px]">
          {backdrop ? <img src={backdrop} alt="" className="absolute inset-0 h-full w-full object-cover" /> : null}
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-netflim-bg via-transparent to-transparent" />

          <div className="mx-auto flex h-full max-w-7xl items-end gap-6 px-4 pb-10 md:px-6">
            {poster ? (
                <img src={poster} alt={title} className="hidden w-[220px] rounded md:block" loading="lazy" decoding="async" />
            ) : null}

            <div className="max-w-2xl">
              <div className="text-4xl font-extrabold tracking-tight text-white md:text-5xl">{title}</div>
              <div className="mt-2 text-sm text-white/70">
                ⭐ {d.vote_average.toFixed(1)}
                {d.genres?.length ? ` • ${d.genres.map((g) => g.name).slice(0, 3).join(', ')}` : ''}
              </div>
              <p className="mt-4 max-h-[7.5rem] overflow-hidden text-sm leading-6 text-white/80 md:text-base">
                {d.overview}
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  className="netflim-btn-primary h-11 px-5"
                  onClick={() => navigate(`/watch/${type}/${id}`)}
                >
                  ▶ Play
                </button>

                {trailer?.key ? (
                  <a
                    href={`https://www.youtube.com/watch?v=${trailer.key}`}
                    target="_blank"
                    rel="noreferrer"
                    className="netflim-btn-secondary h-11 px-5"
                  >
                    Trailer
                  </a>
                ) : null}

                <Link
                  to="/"
                  className="netflim-btn-secondary h-11 px-5 text-white/85"
                >
                  Back
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 pb-16 md:px-6">
        <section className="mt-8">
          <h2 className="text-lg font-semibold text-white">Cast</h2>
          <div className="no-scrollbar mt-3 flex gap-3 overflow-x-auto pb-2">
            {cast.map((c) => {
              const img = tmdbImage(c.profile_path, 'w342')
              return (
                <div key={c.id} className="w-[140px] flex-none">
                  <div className="h-[180px] overflow-hidden rounded bg-white/10">
                    {img ? <img src={img} alt={c.name} className="h-full w-full object-cover" loading="lazy" decoding="async" /> : null}
                  </div>
                  <div className="mt-2 truncate text-sm text-white">{c.name}</div>
                  <div className="truncate text-xs text-white/60">{c.character || ''}</div>
                </div>
              )
            })}
          </div>
        </section>

        {similar.length ? <Row title="More Like This" defaultMediaType={type} items={similar} /> : null}
      </div>
    </div>
  )
}
