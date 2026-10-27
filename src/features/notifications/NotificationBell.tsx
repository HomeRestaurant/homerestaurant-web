import { Link } from 'react-router'
import { badgeText, bellLabel } from './notificationLinks'
import { useUnreadCount } from './queries'

/** Bell link in the header with the unread count; rendered for logged-in users only. */
export function NotificationBell({ className }: { className: string }) {
  const unread = useUnreadCount()
  const count = unread.data?.count ?? 0
  const badge = badgeText(count)

  return (
    <Link to="/notifiche" aria-label={bellLabel(count)} className={`relative ${className}`}>
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        className="size-5"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
        <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
      </svg>
      {badge && (
        <span
          aria-hidden
          className="absolute -right-0.5 -top-0.5 min-w-5 rounded-full bg-brand-500 px-1.5 text-center text-xs leading-5 font-semibold text-white"
        >
          {badge}
        </span>
      )}
    </Link>
  )
}
