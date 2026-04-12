import { create } from 'zustand'

export type ToastType = 'success' | 'error' | 'info'

export type Toast = {
  id: string
  message: string
  type: ToastType
}

type ToastState = {
  toasts: Toast[]
  push: (message: string, type?: ToastType) => void
  remove: (id: string) => void
}

const id = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  push: (message, type = 'info') => {
    const toast: Toast = { id: id(), message, type }
    set((s) => ({ toasts: [toast, ...s.toasts].slice(0, 3) }))
    const ttl = type === 'error' ? 4200 : 2800
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== toast.id) }))
    }, ttl)
  },
  remove: (toastId) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== toastId) })),
}))
