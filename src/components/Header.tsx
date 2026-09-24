import { Link } from 'react-router'
import { useAuth } from '../features/auth/AuthContext'

export function Header() {
  const { isAuthenticated, user, logout } = useAuth()

  return (
    <header className="border-b border-line">
      <div className="mx-auto flex h-20 max-w-5xl items-center justify-between px-6">
        <Link to="/" className="text-xl font-bold text-brand-500">
          HomeRestaurant
        </Link>
        <nav className="flex items-center gap-2 text-sm font-medium">
          <Link to="/pasti/nuovo" className="rounded-full px-4 py-2 hover:bg-gray-100">
            Offri un pasto
          </Link>
          {isAuthenticated ? (
            <>
              <Link to="/i-miei-pasti" className="rounded-full px-4 py-2 hover:bg-gray-100">
                I miei pasti
              </Link>
              <Link to="/profilo" className="rounded-full px-4 py-2 hover:bg-gray-100">
                {user ? `Ciao, ${user.first_name}` : 'Profilo'}
              </Link>
              <button onClick={logout} className="rounded-full px-4 py-2 hover:bg-gray-100">
                Esci
              </button>
            </>
          ) : (
            <>
              <Link to="/accedi" className="rounded-full px-4 py-2 hover:bg-gray-100">
                Accedi
              </Link>
              <Link
                to="/registrati"
                className="rounded-full bg-brand-500 px-4 py-2 text-white hover:bg-brand-600"
              >
                Registrati
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
