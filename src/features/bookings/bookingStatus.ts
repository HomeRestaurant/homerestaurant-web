import type { BookingStatus, CancelledBy } from '../../api/client'

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  pending: 'In attesa',
  confirmed: 'Confermata',
  declined: 'Rifiutata',
  cancelled: 'Annullata',
  expired: 'Scaduta',
}

/** Most seats a single request can ask for (same cap as the backend). */
export const MAX_SEATS_PER_REQUEST = 50

/** "1 posto", "3 posti". */
export function formatSeats(count: number): string {
  return `${count} ${count === 1 ? 'posto' : 'posti'}`
}

/** Values for the seats selector: 1..available, never above the per-request cap. */
export function seatOptions(available: number): number[] {
  const max = Math.min(Math.floor(available), MAX_SEATS_PER_REQUEST)
  return max > 0 ? Array.from({ length: max }, (_, i) => i + 1) : []
}

/** "Annullata dall’ospite" / "Annullata dall’host", with the late flag appended. */
export function cancellationLabel(cancelledBy: CancelledBy | null, late: boolean): string {
  const who = cancelledBy === 'guest' ? ' dall’ospite' : cancelledBy === 'host' ? ' dall’host' : ''
  return `Annullata${who}${late ? ' (disdetta tardiva)' : ''}`
}

/** Status text for a booking, adding who cancelled when relevant. */
export function bookingStatusLabel(booking: {
  status: BookingStatus
  cancelled_by: CancelledBy | null
  cancelled_late: boolean
}): string {
  return booking.status === 'cancelled'
    ? cancellationLabel(booking.cancelled_by, booking.cancelled_late)
    : BOOKING_STATUS_LABELS[booking.status]
}
