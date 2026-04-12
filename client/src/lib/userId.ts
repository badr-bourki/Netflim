const KEY = 'netflim:userId'

function randomId(): string {
  // No crypto dependency; good enough for anonymous per-device identity.
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}-${Math.random().toString(36).slice(2, 10)}`
}

export function getOrCreateUserId(): string {
  const existing = localStorage.getItem(KEY)
  if (existing && existing.length >= 8) return existing
  const id = randomId()
  localStorage.setItem(KEY, id)
  return id
}
