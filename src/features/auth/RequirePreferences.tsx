import { Navigate, Outlet, useLocation } from 'react-router'
import { useAuth } from './AuthContext'

/** Food preferences are part of sign-up: logged-in users who skipped them are sent to finish. */
export function RequirePreferences() {
  const { user } = useAuth()
  const location = useLocation()

  if (user && !user.has_completed_preferences) {
    return <Navigate to="/benvenuto" replace state={{ from: location.pathname }} />
  }
  return <Outlet />
}
