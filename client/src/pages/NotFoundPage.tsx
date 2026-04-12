import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16 md:px-6">
      <div className="relative overflow-hidden rounded bg-white/5 p-10 ring-1 ring-white/10">
        <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-transparent to-black/40" />

        <div className="relative">
          <div className="text-sm font-bold tracking-[0.35em] text-netflim-red">NETFLIM</div>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-white md:text-4xl">We lost that page.</h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-white/65 md:text-base">
            The link may be broken, or the title might have moved. Try going home or searching for what you want.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/" className="netflim-btn-primary">
              Go Home
            </Link>
            <Link to="/search" className="netflim-btn-secondary">
              Search
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
