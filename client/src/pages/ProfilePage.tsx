import { Link } from 'react-router-dom'
import { useAppStore } from '../stores/appStore'
import { useEngagementStore } from '../stores/engagementStore'
import { MovieCard } from '../components/MovieCard'
import type { MediaType, TmdbListResult } from '../types/tmdb'

export default function ProfilePage() {
  const user = useAppStore((s) => s.auth.user)
  const plan = useAppStore((s) => s.subscription.plan)
  const liked = useEngagementStore((s) => s.likedItems)
  const history = useEngagementStore((s) => s.history)

  if (!user) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-14 md:px-6">
        <div className="rounded bg-white/5 p-6 ring-1 ring-white/10">
          <div className="text-xl font-semibold text-white">You’re not signed in</div>
          <div className="mt-2 text-sm text-white/60">Sign in to personalize your experience.</div>
          <Link to="/login" className="netflim-btn-primary mt-5 inline-flex">
            Sign in
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:px-6">
      <div className="rounded bg-white/5 p-6 ring-1 ring-white/10">
        <div className="text-2xl font-bold text-white">Profile</div>
        <div className="mt-1 text-sm text-white/60">Manage your demo account and plan.</div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded bg-black/30 p-4 ring-1 ring-white/10">
            <div className="text-xs font-semibold text-white/60">Name</div>
            <div className="mt-1 text-white">{user.name}</div>
          </div>
          <div className="rounded bg-black/30 p-4 ring-1 ring-white/10">
            <div className="text-xs font-semibold text-white/60">Email</div>
            <div className="mt-1 text-white">{user.email}</div>
          </div>
        </div>

        <div className="mt-4 rounded bg-black/30 p-4 ring-1 ring-white/10">
          <div className="text-xs font-semibold text-white/60">Plan</div>
          <div className="mt-1 text-white">{plan === 'pro' ? 'Pro' : 'Free'}</div>
          <Link to="/pricing" className="mt-3 inline-flex text-sm font-semibold text-white/90 hover:underline">
            View pricing
          </Link>
        </div>

        <div className="mt-8">
          <div className="flex items-end justify-between">
            <div>
              <div className="text-lg font-semibold text-white">Likes</div>
              <div className="mt-1 text-sm text-white/60">{liked.length} saved</div>
            </div>
          </div>

          {liked.length === 0 ? (
            <div className="mt-3 rounded bg-black/30 p-4 text-sm text-white/60 ring-1 ring-white/10">
              Like titles to build your taste profile.
            </div>
          ) : (
            <div className="no-scrollbar mt-3 flex gap-3 overflow-x-auto overflow-y-visible">
              {liked.slice(0, 12).map((x) => {
                const m: TmdbListResult = {
                  id: x.tmdbId,
                  media_type: x.mediaType,
                  title: x.title,
                  name: x.title,
                  poster_path: x.posterPath,
                  backdrop_path: x.backdropPath,
                  overview: '',
                  vote_average: 7.8,
                }
                return <MovieCard key={`${x.mediaType}:${x.tmdbId}`} item={m} mediaType={x.mediaType as MediaType} />
              })}
            </div>
          )}
        </div>

        <div className="mt-8">
          <div className="flex items-end justify-between">
            <div>
              <div className="text-lg font-semibold text-white">Watch history</div>
              <div className="mt-1 text-sm text-white/60">{history.length} recently watched</div>
            </div>
          </div>

          {history.length === 0 ? (
            <div className="mt-3 rounded bg-black/30 p-4 text-sm text-white/60 ring-1 ring-white/10">
              Start watching to populate your history.
            </div>
          ) : (
            <div className="no-scrollbar mt-3 flex gap-3 overflow-x-auto overflow-y-visible">
              {history.slice(0, 12).map((x) => {
                const m: TmdbListResult = {
                  id: x.tmdbId,
                  media_type: x.mediaType,
                  title: x.title,
                  name: x.title,
                  poster_path: x.posterPath,
                  backdrop_path: x.backdropPath,
                  overview: '',
                  vote_average: 7.2,
                }
                return <MovieCard key={`${x.mediaType}:${x.tmdbId}`} item={m} mediaType={x.mediaType as MediaType} />
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
