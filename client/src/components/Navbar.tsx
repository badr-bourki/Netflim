import { NavLink, useNavigate } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { useAppStore } from '../stores/appStore'

function navClass(isActive: boolean) {
  return (
    'relative rounded px-2 py-2 text-sm transition-colors hover:bg-white/5 hover:ring-1 hover:ring-white/10 ' +
    (isActive ? 'text-white' : 'text-white/70 hover:text-white') +
    " after:absolute after:left-0 after:-bottom-0.5 after:h-0.5 after:w-full after:bg-white after:content-[''] " +
    (isActive
      ? 'after:scale-x-100'
      : 'after:origin-left after:scale-x-0 after:transition-transform after:duration-300 hover:after:scale-x-100')
  )
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const navigate = useNavigate()

  const user = useAppStore((s) => s.auth.user)
  const logout = useAppStore((s) => s.logout)
  const plan = useAppStore((s) => s.subscription.plan)

  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)

  const initials = (() => {
    if (!user?.name) return 'G'
    const parts = user.name.trim().split(/\s+/).slice(0, 2)
    return parts.map((p) => p[0]?.toUpperCase()).join('') || 'U'
  })()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!menuOpen) return
    const onDown = (e: MouseEvent) => {
      const el = menuRef.current
      if (!el) return
      if (e.target instanceof Node && el.contains(e.target)) return
      setMenuOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('mousedown', onDown)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('mousedown', onDown)
      window.removeEventListener('keydown', onKey)
    }
  }, [menuOpen])

  return (
    <header
      className={
        'fixed left-0 right-0 top-0 z-40 transition-colors duration-300 ' +
        (scrolled
          ? 'bg-netflim-bg/95 backdrop-blur'
          : 'bg-gradient-to-b from-black/70 via-black/30 to-transparent')
      }
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4">
        <button
          type="button"
          className="group inline-flex items-center gap-2 font-extrabold tracking-widest text-netflim-red"
          onClick={() => navigate('/')}
          aria-label="Go to home"
        >
          <img
            src="/netflim-logo.svg"
            alt="NETFLIM"
            className="h-8 w-auto object-contain transition-transform duration-300 group-hover:scale-[1.02]"
          />
        </button>

        <nav className="no-scrollbar flex flex-1 items-center gap-5 overflow-x-auto whitespace-nowrap pr-2">
          <NavLink to="/" className={({ isActive }) => navClass(isActive)} end>
            Home
          </NavLink>
          <NavLink to="/movies" className={({ isActive }) => navClass(isActive)}>
            Movies
          </NavLink>
          <NavLink to="/tv" className={({ isActive }) => navClass(isActive)}>
            TV
          </NavLink>
          <NavLink to="/search" className={({ isActive }) => navClass(isActive)}>
            Search
          </NavLink>
          <NavLink to="/my-list" className={({ isActive }) => navClass(isActive)}>
            My List
          </NavLink>
        </nav>

        <div className="ml-auto flex items-center gap-3">
          {plan === 'pro' ? (
            <div className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-white ring-1 ring-white/10">
              PRO
            </div>
          ) : null}

          {user ? null : (
            <button
              type="button"
              className="hidden h-9 rounded bg-white/10 px-3 text-sm font-semibold text-white hover:bg-white/15 md:inline-flex"
              onClick={() => navigate('/login')}
            >
              Sign In
            </button>
          )}

          <div className="relative" ref={menuRef}>
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-sm font-bold text-white ring-1 ring-white/10 transition hover:bg-white/15 hover:ring-white/20"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Open user menu"
              aria-expanded={menuOpen}
            >
              {initials}
            </button>

            {menuOpen ? (
              <div className="netflim-glass absolute right-0 mt-2 w-56 overflow-hidden rounded">
                <div className="px-3 py-2 text-xs text-white/60">
                  {user ? user.email : 'Guest'}
                </div>
                <div className="h-px bg-white/10" />

                <button
                  type="button"
                  className="block w-full px-3 py-2 text-left text-sm text-white/85 hover:bg-white/10"
                  onClick={() => {
                    setMenuOpen(false)
                    navigate(user ? '/profile' : '/login')
                  }}
                >
                  Profile
                </button>
                <button
                  type="button"
                  className="block w-full px-3 py-2 text-left text-sm text-white/85 hover:bg-white/10"
                  onClick={() => {
                    setMenuOpen(false)
                    navigate('/my-list')
                  }}
                >
                  My List
                </button>
                <button
                  type="button"
                  className="block w-full px-3 py-2 text-left text-sm text-white/85 hover:bg-white/10"
                  onClick={() => {
                    setMenuOpen(false)
                    navigate('/pricing')
                  }}
                >
                  Pricing
                </button>

                <div className="h-px bg-white/10" />

                {user ? (
                  <button
                    type="button"
                    className="block w-full px-3 py-2 text-left text-sm text-white/85 hover:bg-white/10"
                    onClick={() => {
                      setMenuOpen(false)
                      logout()
                    }}
                  >
                    Logout
                  </button>
                ) : (
                  <div className="px-3 py-2 text-xs text-white/60">Create an account to sync devices.</div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  )
}
