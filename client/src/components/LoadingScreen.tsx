import { useState } from 'react'

export function LoadingScreen() {
  const [logoFailed, setLogoFailed] = useState(false)

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center rounded-full bg-white/5 px-6 py-4 ring-1 ring-white/10">
          {!logoFailed ? (
            <img
              src="/netflim-logo.png"
              alt="NETFLIM"
              className="h-12 w-auto animate-pulse object-contain"
              onError={() => setLogoFailed(true)}
            />
          ) : null}
          {logoFailed ? <div className="text-2xl font-extrabold tracking-[0.35em] text-netflim-red animate-pulse">NETFLIM</div> : null}
        </div>
        <div className="mt-4 text-sm text-white/60">Loading your next watch…</div>
      </div>
    </div>
  )
}
