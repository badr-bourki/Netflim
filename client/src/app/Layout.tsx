import { Outlet, useLocation } from 'react-router-dom'
import { Navbar } from '../components/Navbar'

export function Layout() {
  const location = useLocation()

  return (
    <div className="min-h-screen bg-netflim-bg">
      <Navbar />
      <main className="pt-16">
        <div key={location.pathname} className="netflim-page-fade">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
