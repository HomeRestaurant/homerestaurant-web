import { Navigate, Outlet, useLocation } from 'react-router'
import { useAuth } from './AuthContext'

/** Wrap routes that need a logged-in user; others are sent to the login page and back. */
export function RequireAuth() {
  const { isAuthenticated } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) return <Navigate to="/accedi" replace state={{ from: location.pathname }} />
  return <Outlet />
}
