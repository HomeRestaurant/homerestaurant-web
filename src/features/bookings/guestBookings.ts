import type { BookingStatus, GuestBooking, Slot } from '../../api/client'

type ActiveBooking = Pick<GuestBooking, 'slot_id' | 'status'>

/** The guest's live request (pending or confirmed) for each date, by slot id. */
export function activeBookingBySlot<T extends ActiveBooking>(bookings: T[]): Map<string, T> {
  const bySlot = new Map<string, T>()
  for (const booking of bookings) {
    if (booking.slot_id && (booking.status === 'pending' || booking.status === 'confirmed')) {
      bySlot.set(booking.slot_id, booking)
    }
  }
  return bySlot
}

/** What to tell the guest in place of the date choice when a request already exists. */
export function activeBookingText(status: BookingStatus): string {
  return status === 'confirmed' ? 'Prenotazione confermata' : 'Richiesta inviata, in attesa'
}

/** Dates still ahead, earliest first. */
export function futureSlots(slots: Slot[], now: Date = new Date()): Slot[] {
  return slots
    .filter((slot) => new Date(slot.starts_at) > now)
    .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime())
}

/** A date can be requested if it has free seats and the guest has no live request for it. */
export function isChoosable(slot: Slot, active: Map<string, unknown>): boolean {
  return slot.available_seats > 0 && !active.has(slot.id)
}

/** The selected date if still valid, else the first date that can be requested. */
export function resolveSelectedSlot(
  slots: Slot[],
  active: Map<string, unknown>,
  selectedId: string | null,
): Slot | undefined {
  const choosable = slots.filter((slot) => isChoosable(slot, active))
  return choosable.find((slot) => slot.id === selectedId) ?? choosable[0]
}

/** Keeps the chosen number of seats within what the date still offers. */
export function clampSeats(seats: number, available: number): number {
  return Math.max(1, Math.min(seats, available))
}

/**
 * Whether the request the guest reviewed can still be sent as is: the date must still be
 * there, free of a live request, with enough seats for what was chosen.
 */
export function isRequestStillValid(
  slots: Slot[],
  slotId: string,
  seats: number,
  active: Map<string, unknown> = new Map(),
): boolean {
  const slot = slots.find((candidate) => candidate.id === slotId)
  return !!slot && !active.has(slot.id) && slot.available_seats >= seats
}

/** Withdrawing or cancelling only makes sense for a live request on a meal not yet started. */
export function canCancelBooking(
  booking: Pick<GuestBooking, 'status' | 'starts_at'>,
  now: Date = new Date(),
): boolean {
  const isLive = booking.status === 'pending' || booking.status === 'confirmed'
  return isLive && new Date(booking.starts_at) > now
}

/** Text of the first step of the cancel flow, depending on what the guest is undoing. */
export function cancelCopy(status: BookingStatus) {
  return status === 'pending'
    ? {
        label: 'Ritira la richiesta',
        confirmLabel: 'Conferma il ritiro',
        pendingLabel: 'Ritiro…',
        done: 'Richiesta ritirata: l’host è stato avvisato.',
      }
    : {
        label: 'Disdici',
        confirmLabel: 'Conferma la disdetta',
        pendingLabel: 'Disdetta…',
        done: 'Prenotazione disdetta: l’host è stato avvisato.',
      }
}
