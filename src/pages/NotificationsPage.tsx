import { useNavigate } from 'react-router'
import type { Notification } from '../api/client'
import { Button } from '../components/Button'
import { FormError } from '../components/FormError'
import { PageState } from '../components/PageState'
import { isNavigableLink } from '../features/notifications/notificationLinks'
import { useMarkAllRead, useMarkRead, useNotifications } from '../features/notifications/queries'
import { formatRelativeDate } from '../lib/format'

export function NotificationsPage() {
  const notifications = useNotifications()
  const markRead = useMarkRead()
  const markAllRead = useMarkAllRead()
  const navigate = useNavigate()
  const hasUnread = notifications.data?.some((n) => !n.read_at) ?? false

  function open(notification: Notification) {
    if (!notification.read_at) markRead.mutate(notification.id)
    if (isNavigableLink(notification.link)) navigate(notification.link)
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-semibold">Notifiche</h1>
        <Button
          variant="secondary"
          size="sm"
          disabled={!hasUnread || markAllRead.isPending}
          onClick={() => markAllRead.mutate()}
        >
          {markAllRead.isPending ? 'Un attimo…' : 'Segna tutte come lette'}
        </Button>
      </div>
      {(markRead.error ?? markAllRead.error) && (
        <div className="mt-4">
          <FormError error={markRead.error ?? markAllRead.error} />
        </div>
      )}

      {notifications.isPending && <PageState>Caricamento…</PageState>}
      {notifications.isError && (
        <PageState>
          <p>Non riusciamo a caricare le notifiche.</p>
          <Button variant="secondary" className="mt-4" onClick={() => notifications.refetch()}>
            Riprova
          </Button>
        </PageState>
      )}
      {notifications.data?.length === 0 && (
        <PageState>Nessuna notifica per ora. Ti avviseremo qui quando succede qualcosa.</PageState>
      )}

      <ul className="mt-4 space-y-2">
        {notifications.data?.map((notification) => {
          const unread = !notification.read_at
          return (
            <li key={notification.id}>
              <button
                onClick={() => open(notification)}
                className={`w-full rounded-card border p-4 text-left transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 ${
                  unread ? 'border-brand-100 bg-brand-50' : 'border-line'
                }`}
              >
                <span className="flex items-start justify-between gap-3">
                  <span className={`break-words ${unread ? 'font-semibold' : 'font-medium'}`}>
                    {unread && <span className="sr-only">Non letta. </span>}
                    {notification.title}
                  </span>
                  <time dateTime={notification.created_at} className="shrink-0 text-xs text-muted">
                    {formatRelativeDate(notification.created_at)}
                  </time>
                </span>
                <span className="mt-1 block text-sm break-words text-ink">{notification.body}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </main>
  )
}
