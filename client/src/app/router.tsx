/* eslint-disable react-refresh/only-export-components */
import { createBrowserRouter } from 'react-router-dom'
import { lazy } from 'react'
import { Layout } from './Layout'

const HomePage = lazy(() => import('../pages/HomePage'))
const MoviesPage = lazy(() => import('../pages/MoviesPage'))
const TvPage = lazy(() => import('../pages/TvPage'))
const SearchPage = lazy(() => import('../pages/SearchPage'))
const MyListPage = lazy(() => import('../pages/MyListPage'))
const PricingPage = lazy(() => import('../pages/PricingPage'))
const LoginPage = lazy(() => import('../pages/LoginPage'))
const RegisterPage = lazy(() => import('../pages/RegisterPage'))
const ProfilePage = lazy(() => import('../pages/ProfilePage'))
const DetailsPage = lazy(() => import('../pages/DetailsPage'))
const WatchPage = lazy(() => import('../pages/WatchPage'))
const NotFoundPage = lazy(() => import('../pages/NotFoundPage'))

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    errorElement: <NotFoundPage />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'movies', element: <MoviesPage /> },
      { path: 'tv', element: <TvPage /> },
      { path: 'search', element: <SearchPage /> },
      { path: 'my-list', element: <MyListPage /> },
      { path: 'pricing', element: <PricingPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      { path: 'profile', element: <ProfilePage /> },
      { path: 'details/:type/:id', element: <DetailsPage /> },
      { path: 'watch/:type/:id', element: <WatchPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
