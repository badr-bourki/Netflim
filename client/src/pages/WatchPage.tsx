import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import type { MediaType } from '../types/tmdb'
import { getDetails } from '../lib/tmdbApi'
import { apiGet } from '../lib/api'
import { useToastStore } from '../stores/toastStore'
import { saveProgress } from '../lib/progress'
import { useAppStore } from '../stores/appStore'
import { AdSlot } from '../components/AdSlot'
import { useEngagementStore } from '../stores/engagementStore'

type ProviderId = 'vidsrc' | 'autoembed' | 'twoembed'

type Provider = {
  id: ProviderId
  label: string
  buildUrl: (p: { type: MediaType; tmdbId: string; season: number; episode: number }) => string
}

const PROVIDERS: Provider[] = [
  {
    id: 'vidsrc',
    label: 'VidSrc',
    buildUrl: ({ type, tmdbId, season, episode }) =>
      type === 'movie'
        ? `https://vidsrc.to/embed/movie/${tmdbId}`
        : `https://vidsrc.to/embed/tv/${tmdbId}/${season}/${episode}`,
  },
  {
    id: 'autoembed',
    label: 'AutoEmbed',
    buildUrl: ({ type, tmdbId, season, episode }) =>
      type === 'movie'
        ? `https://autoembed.co/movie/tmdb/${tmdbId}`
        : `https://autoembed.co/tv/tmdb/${tmdbId}-${season}-${episode}`,
  },
  {
    id: 'twoembed',
    label: '2embed',
    buildUrl: ({ type, tmdbId, season, episode }) =>
      type === 'movie'
        ? `https://www.2embed.cc/embed/movie?tmdb=${tmdbId}`
        : `https://www.2embed.cc/embedtv?tmdb=${tmdbId}&s=${season}&e=${episode}`,
  },
]

type SubtitlesResponse = { items: Array<{ lang: string; fileName: string; url: string }>; warning?: string }

export default function WatchPage() {
  const params = useParams()
  const type = (params.type as MediaType) || 'movie'
  const tmdbId = params.id || ''

  const pushToast = useToastStore((s) => s.push)

  const persistedProviderId = useAppStore((s) => s.currentPlayer.providerId)
  const setProviderId = useAppStore((s) => s.setProviderId)
  const plan = useAppStore((s) => s.subscription.plan)

  const pushHistory = useEngagementStore((s) => s.pushHistory)

  const initialIdx = Math.max(0, PROVIDERS.findIndex((p) => p.id === persistedProviderId))
  const [providerIdx, setProviderIdx] = useState(initialIdx)
  const provider = PROVIDERS[providerIdx]

  const [season, setSeason] = useState(1)
  const [episode, setEpisode] = useState(1)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const timeoutRef = useRef<number | null>(null)
  const [reloadToken, setReloadToken] = useState(0)

  const details = useQuery({
    queryKey: ['details', type, tmdbId],
    queryFn: () => getDetails(type, tmdbId),
    enabled: Boolean(tmdbId) && (type === 'movie' || type === 'tv'),
  })

  useEffect(() => {
    const d = details.data
    if (!d) return
    pushHistory({
      tmdbId: d.id,
      mediaType: type,
      title: d.title || d.name || 'Untitled',
      posterPath: d.poster_path,
      backdropPath: d.backdrop_path,
    })
  }, [details.data, pushHistory, type])

  const src = useMemo(() => {
    return provider.buildUrl({ type, tmdbId, season, episode })
  }, [provider, type, tmdbId, season, episode])

  const progressMutation = useMutation({
    mutationFn: () => saveProgress({ tmdbId: Number(tmdbId), mediaType: type, progress: 0.02, season, episode }),
    onError: () => {
      pushToast('Continue Watching is unavailable (DB not connected?)')
    },
  })

  useEffect(() => {
    // Save a tiny progress point on open (we cannot track cross-origin iframe playback precisely).
    if (tmdbId) progressMutation.mutate()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tmdbId, type, season, episode])

  const [lang, setLang] = useState<'en' | 'ar' | 'fr'>('en')
  const subtitles = useQuery({
    queryKey: ['subtitles', type, tmdbId, lang],
    queryFn: () => apiGet<SubtitlesResponse>(`/api/subtitles?tmdbId=${tmdbId}&type=${type}&lang=${lang}`),
    enabled: Boolean(tmdbId),
  })

  const title = details.data?.title || details.data?.name || 'Watch'

  const switchTo = (nextIdx: number) => {
    setProviderIdx(nextIdx)
    setProviderId(PROVIDERS[nextIdx]?.id || 'vidsrc')
    setError(null)
    setLoading(true)
  }

  const tryAnother = () => {
    const next = (providerIdx + 1) % PROVIDERS.length
    pushToast('Switching server…')
    switchTo(next)
  }

  const retry = () => {
    pushToast('Retrying…', 'info')
    setError(null)
    setLoading(true)
    setReloadToken((t) => t + 1)
  }

  useEffect(() => {
    setLoading(true)
    setError(null)

    if (timeoutRef.current) window.clearTimeout(timeoutRef.current)
    timeoutRef.current = window.setTimeout(() => {
      setError('This server is taking too long to respond.')
      tryAnother()
    }, 8000)

    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src])

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
      <div className="rounded bg-white/5 p-4 ring-1 ring-white/10">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="text-sm text-white/60">Playing via {provider.label}</div>
            <h1 className="text-2xl font-semibold text-white">{title}</h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded bg-black/30 px-3 py-2 text-sm text-white/70 ring-1 ring-white/10">
              Server {providerIdx + 1}/{PROVIDERS.length}
            </div>

          {type === 'tv' ? (
            <div className="flex items-center gap-2 text-sm text-white/80">
              <label className="flex items-center gap-2">
                S
                <input
                  type="number"
                  min={1}
                  value={season}
                  onChange={(e) => setSeason(Math.max(1, Number(e.target.value)))}
                  className="h-10 w-16 rounded border border-white/15 bg-black/30 px-2 text-white"
                />
              </label>
              <label className="flex items-center gap-2">
                E
                <input
                  type="number"
                  min={1}
                  value={episode}
                  onChange={(e) => setEpisode(Math.max(1, Number(e.target.value)))}
                  className="h-10 w-16 rounded border border-white/15 bg-black/30 px-2 text-white"
                />
              </label>
            </div>
          ) : null}

          <label className="flex items-center gap-2 text-sm text-white/80">
            Provider
            <select
              value={provider.id}
              onChange={(e) => {
                const idx = PROVIDERS.findIndex((p) => p.id === e.target.value)
                if (idx >= 0) switchTo(idx)
              }}
              className="h-10 rounded border border-white/15 bg-black/30 px-3 text-white"
            >
              {PROVIDERS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            className="netflim-btn-secondary h-10 px-4"
            onClick={tryAnother}
          >
            Try another server
          </button>

          <button type="button" className="netflim-btn-secondary h-10 px-4" onClick={retry}>
            Retry
          </button>
        </div>
        </div>
      </div>

      {plan === 'free' ? <AdSlot label="Ad before playback" /> : null}

      <div className="relative mt-5 overflow-hidden rounded bg-black ring-1 ring-white/10">
        <div className="aspect-video w-full">
          <iframe
            key={`${provider.id}-${src}-${reloadToken}`}
            src={src}
            className="h-full w-full"
            allowFullScreen
            referrerPolicy="no-referrer"
            onLoad={() => {
              setLoading(false)
              if (timeoutRef.current) window.clearTimeout(timeoutRef.current)
              timeoutRef.current = null
            }}
          />
        </div>

        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <div className="flex items-center gap-3 rounded bg-black/70 px-4 py-3 text-sm text-white ring-1 ring-white/10">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              <div>Loading player…</div>
            </div>
          </div>
        ) : null}

        {error ? (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70">
            <div className="max-w-md rounded bg-black/80 p-4 text-center">
              <div className="text-sm text-white/80">{error}</div>
              <button
                type="button"
                className="netflim-btn-primary mt-3"
                onClick={tryAnother}
              >
                Try another server
              </button>
            </div>
          </div>
        ) : null}
      </div>

      <section className="mt-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h2 className="text-lg font-semibold text-white">Subtitles</h2>

          <label className="flex items-center gap-2 text-sm text-white/80">
            Language
            <select
              value={lang}
              onChange={(e) => {
                const v = e.target.value
                if (v === 'en' || v === 'ar' || v === 'fr') setLang(v)
              }}
              className="h-10 rounded border border-white/15 bg-black/30 px-3 text-white"
            >
              <option value="ar">Arabic</option>
              <option value="en">English</option>
              <option value="fr">French</option>
            </select>
          </label>
        </div>

        {subtitles.isLoading ? <div className="mt-3 text-sm text-white/60">Fetching subtitles…</div> : null}
        {subtitles.data?.warning ? <div className="mt-3 text-sm text-white/60">{subtitles.data.warning}</div> : null}

        <div className="mt-3 flex flex-col gap-2">
          {(subtitles.data?.items || []).length === 0 && !subtitles.isLoading ? (
            <div className="text-sm text-white/60">No subtitles found.</div>
          ) : null}

          {(subtitles.data?.items || []).map((s) => (
            <a
              key={s.url}
              href={s.url}
              target="_blank"
              rel="noreferrer"
              className="rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10"
            >
              Download {s.fileName}
            </a>
          ))}
        </div>
      </section>
    </div>
  )
}
