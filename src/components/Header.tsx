import { Link } from 'react-router'
import { useAuth } from '../features/auth/AuthContext'

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2'
const navItem = `rounded-full px-4 py-2 transition-colors hover:bg-gray-100 ${focusRing}`

export function Header() {
  const { isAuthenticated, user, logout } = useAuth()

  return (
    <header className="border-b border-line">
      {/* Visible only when focused: first Tab stop on every page */}
      <a
        href="#contenuto"
        className={`sr-only rounded-lg bg-ink px-4 py-2 text-sm font-medium text-white focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-10 ${focusRing}`}
      >
        Salta al contenuto
      </a>
      {/* Wraps onto two rows on narrow screens instead of scrolling sideways */}
      <div className="mx-auto flex min-h-20 max-w-5xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-6 py-3">
        <Link
          to="/"
          translate="no"
          className={`rounded-lg text-xl font-bold text-brand-500 ${focusRing}`}
        >
          HomeRestaurant
        </Link>
        <nav className="flex min-w-0 flex-wrap items-center gap-2 text-sm font-medium">
          <Link to="/pasti/nuovo" className={navItem}>
            Offri un pasto
          </Link>
          {isAuthenticated ? (
            <>
              <Link to="/i-miei-pasti" className={navItem}>
                I miei pasti
              </Link>
              <Link to="/profilo" className={`${navItem} max-w-48 truncate`}>
                {user ? `Ciao, ${user.first_name}` : 'Profilo'}
              </Link>
              <button onClick={logout} className={navItem}>
                Esci
              </button>
            </>
          ) : (
            <>
              <Link to="/accedi" className={navItem}>
                Accedi
              </Link>
              <Link
                to="/registrati"
                className={`rounded-full bg-brand-500 px-4 py-2 text-white transition-colors hover:bg-brand-600 ${focusRing}`}
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
