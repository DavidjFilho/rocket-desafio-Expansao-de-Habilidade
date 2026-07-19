import { Navbar } from '@/components/Navbar'
import { Spinner } from '@/components/ui/Feedback'
import { useAuth } from '@/contexts/AuthContext'
import { Navigate, Outlet } from 'react-router-dom'

export function ProtectedLayout() {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <main className="mx-auto max-w-[1280px] px-4 py-8 sm:px-12">
        <Outlet />
      </main>
    </div>
  )
}

export function PublicOnlyLayout() {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
