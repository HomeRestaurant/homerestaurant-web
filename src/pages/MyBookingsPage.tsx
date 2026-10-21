import { useState } from 'react'
import { Link } from 'react-router'
import type { BookingScope, GuestBooking } from '../api/client'
import { Button } from '../components/Button'
import { ChipRadio } from '../components/ChipSelect'
import { ConfirmAction } from '../components/ConfirmAction'
import { FormError } from '../components/FormError'
import { PageState } from '../components/PageState'
import {
  BOOKING_STATUS_STYLES,
  bookingStatusLabel,
  formatSeats,
} from '../features/bookings/bookingStatus'
import { cancelCopy } from '../features/bookings/guestBookings'
import { useCancelMyBooking, useMyBookings } from '../features/bookings/queries'
import { formatLongDate, formatSlotTime } from '../lib/format'

const SCOPE_LABELS: Record<BookingScope, string> = { upcoming: 'In arrivo', past: 'Passate' }

const EMPTY_TEXT: Record<BookingScope, string> = {
  upcoming: 'Non hai ancora nessuna prenotazione in arrivo.',
  past: 'Nessuna prenotazione passata.',
}

export function MyBookingsPage() {
  const [scope, setScope] = useState<BookingScope>('upcoming')
  // The past list is only fetched once its tab is opened
  const bookings = useMyBookings({ scope })
  const cancel = useCancelMyBooking()
  const [message, setMessage] = useState('')

  function cancelBooking(booking: GuestBooking, done: () => void) {
    setMessage('')
    cancel.mutate(booking.id, {
      onSuccess: () => {
        setMessage(cancelCopy(booking.status).done)
        done()
      },
    })
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="text-3xl font-semibold">Le mie prenotazioni</h1>

      <div className="mt-6">
        <ChipRadio
          aria-label="Filtra le prenotazioni"
          options={SCOPE_LABELS}
          value={scope}
          onChange={(next) => {
            setScope(next)
            setMessage('')
            cancel.reset()
          }}
        />
      </div>

      {/* Always mounted so screen readers announce the outcome when it appears */}
      <p role="status" className="mt-4 text-sm text-green-700">
        {message}
      </p>

      {bookings.isPending && <PageState>Caricamento…</PageState>}
      {bookings.isError && (
        <PageState>
          <p>Non riusciamo a caricare le tue prenotazioni.</p>
          <Button variant="secondary" className="mt-4" onClick={() => bookings.refetch()}>
            Riprova
          </Button>
        </PageState>
      )}
      {bookings.data?.length === 0 && (
        <PageState>
          <p>{EMPTY_TEXT[scope]}</p>
          <Link to="/" className="mt-2 inline-block font-semibold text-ink underline">
            Cerca un pasto
          </Link>
        </PageState>
      )}

      <ul className="mt-2 divide-y divide-line">
        {bookings.data?.map((booking) => (
          <BookingRow
            key={booking.id}
            booking={booking}
            isCancelling={cancel.isPending && cancel.variables === booking.id}
            error={cancel.variables === booking.id ? cancel.error : null}
            onCancel={(done) => cancelBooking(booking, done)}
          />
        ))}
      </ul>
    </main>
  )
}

function BookingRow({
  booking,
  isCancelling,
  error,
  onCancel,
}: {
  booking: GuestBooking
  isCancelling: boolean
  error: Error | null
  onCancel: (done: () => void) => void
}) {
  const { meal } = booking
  const place = [meal.neighborhood, meal.city].filter(Boolean).join(', ')
  const isActive = booking.status === 'pending' || booking.status === 'confirmed'
  const copy = cancelCopy(booking.status)

  return (
    <li className="space-y-3 py-5">
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
        <h2 className="min-w-0 text-lg font-semibold break-words">
          <Link to={`/pasti/${meal.id}`} className="underline-offset-2 hover:underline">
            {meal.title}
          </Link>
        </h2>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${BOOKING_STATUS_STYLES[booking.status]}`}
        >
          {bookingStatusLabel(booking)}
        </span>
      </div>

      <p>
        <span className="inline-block first-letter:uppercase">
          {formatLongDate(booking.starts_at)}
        </span>
        , {formatSlotTime(booking.starts_at)}
      </p>
      <p className="text-sm text-muted">
        {place} · con {meal.host.first_name} · {formatSeats(booking.seats)}
      </p>

      {booking.exact_address && (
        <p className="rounded-card bg-brand-50 p-4 font-semibold break-words">
          Indirizzo: {booking.exact_address}
        </p>
      )}
      {booking.message && (
        <p className="text-sm break-words whitespace-pre-line">
          Il tuo messaggio: “{booking.message}”
        </p>
      )}
      {booking.status_reason && (
        <p className="text-sm text-muted break-words">Motivo: {booking.status_reason}</p>
      )}

      {isActive && (
        <div className="space-y-2 text-sm">
          {booking.late_cancellation_window && (
            <p className="text-muted">
              Manca poco all’inizio: la disdetta verrà registrata come tardiva.
            </p>
          )}
          <ConfirmAction
            label={copy.label}
            ariaLabel={`${copy.label}: ${meal.title}`}
            confirmLabel={copy.confirmLabel}
            pendingLabel={copy.pendingLabel}
            isPending={isCancelling}
            onConfirm={onCancel}
          />
        </div>
      )}
      <FormError error={error} />
    </li>
  )
}
