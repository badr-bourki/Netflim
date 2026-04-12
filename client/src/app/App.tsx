import { RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Suspense } from 'react'
import { router } from './router'
import { ToastHost } from '../components/ToastHost'
import { LoadingScreen } from '../components/LoadingScreen'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      refetchOnWindowFocus: false,
      retry: 0,
    },
  },
})

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={<LoadingScreen />}>
        <RouterProvider router={router} />
      </Suspense>
      <ToastHost />
    </QueryClientProvider>
  )
}
