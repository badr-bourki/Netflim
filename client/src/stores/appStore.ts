import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ProviderId = 'vidsrc' | 'autoembed' | 'twoembed'

export type SubscriptionPlan = 'free' | 'pro'

export type AuthUser = {
  name: string
  email: string
}

type AppState = {
  searchQuery: string
  setSearchQuery: (q: string) => void

  currentPlayer: {
    providerId: ProviderId
  }
  setProviderId: (id: ProviderId) => void

  subscription: {
    plan: SubscriptionPlan
  }
  setPlan: (plan: SubscriptionPlan) => void

  auth: {
    user: AuthUser | null
  }
  login: (u: AuthUser) => void
  logout: () => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      searchQuery: '',
      setSearchQuery: (q) => set({ searchQuery: q }),

      currentPlayer: { providerId: 'vidsrc' },
      setProviderId: (id) => set({ currentPlayer: { providerId: id } }),

      subscription: { plan: 'free' },
      setPlan: (plan) => set({ subscription: { plan } }),

      auth: { user: null },
      login: (u) => set({ auth: { user: u } }),
      logout: () => set({ auth: { user: null } }),
    }),
    { name: 'netflim:app' },
  ),
)
