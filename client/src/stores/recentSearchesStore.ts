import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type State = {
  recent: string[]
  add: (q: string) => void
  clear: () => void
}

export const useRecentSearchesStore = create<State>()(
  persist(
    (set, get) => ({
      recent: [],
      add: (q) => {
        const query = q.trim()
        if (!query) return
        const next = [query, ...get().recent.filter((x) => x.toLowerCase() !== query.toLowerCase())].slice(0, 8)
        set({ recent: next })
      },
      clear: () => set({ recent: [] }),
    }),
    { name: 'netflim:recent-searches' },
  ),
)
