import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAppStore } from '../stores/appStore'

export default function LoginPage() {
  const navigate = useNavigate()
  const login = useAppStore((s) => s.login)

  const [email, setEmail] = useState('')
  const [name, setName] = useState('')

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <div className="rounded bg-white/5 p-6 ring-1 ring-white/10">
        <div className="text-2xl font-bold text-white">Sign in</div>
        <div className="mt-1 text-sm text-white/60">Fake auth (local-only) to make the product feel real.</div>

        <div className="mt-6 space-y-3">
          <label className="block">
            <div className="text-xs font-semibold text-white/70">Name</div>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Alex"
              className="mt-1 h-11 w-full rounded border border-white/10 bg-black/30 px-3 text-white placeholder:text-white/30"
            />
          </label>

          <label className="block">
            <div className="text-xs font-semibold text-white/70">Email</div>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@netflim.com"
              className="mt-1 h-11 w-full rounded border border-white/10 bg-black/30 px-3 text-white placeholder:text-white/30"
            />
          </label>

          <button
            type="button"
            className="netflim-btn-primary h-11 w-full"
            onClick={() => {
              const cleanEmail = email.trim()
              const cleanName = name.trim() || 'User'
              if (!cleanEmail) return
              login({ email: cleanEmail, name: cleanName })
              navigate('/')
            }}
          >
            Continue
          </button>

          <div className="text-center text-sm text-white/60">
            New here?{' '}
            <Link to="/register" className="font-semibold text-white hover:underline">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
