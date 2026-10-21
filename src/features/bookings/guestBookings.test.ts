import { describe, expect, it } from 'vitest'
import type { Slot } from '../../api/client'
import {
  activeBookingBySlot,
  activeBookingText,
  cancelCopy,
  clampSeats,
  futureSlots,
  isChoosable,
  resolveSelectedSlot,
} from './guestBookings'

function slot(id: string, startsAt: string, available: number): Slot {
  return { id, starts_at: startsAt, capacity: 6, available_seats: available }
}

const NOW = new Date('2030-05-01T12:00:00Z')

describe('activeBookingBySlot', () => {
  it('keeps only pending and confirmed requests that still have a slot', () => {
    const map = activeBookingBySlot([
      { slot_id: 'a', status: 'pending' as const },
      { slot_id: 'b', status: 'confirmed' as const },
      { slot_id: 'c', status: 'declined' as const },
      { slot_id: 'd', status: 'cancelled' as const },
      { slot_id: null, status: 'pending' as const },
    ])
    expect([...map.keys()]).toEqual(['a', 'b'])
  })
})

describe('activeBookingText', () => {
  it('distinguishes waiting from confirmed', () => {
    expect(activeBookingText('pending')).toBe('Richiesta inviata, in attesa')
    expect(activeBookingText('confirmed')).toBe('Prenotazione confermata')
  })
})

describe('futureSlots', () => {
  it('drops past dates, including one starting right now, and sorts the rest', () => {
    const result = futureSlots(
      [
        slot('late', '2030-06-02T18:00:00Z', 3),
        slot('past', '2030-04-01T18:00:00Z', 3),
        slot('now', NOW.toISOString(), 3),
        slot('soon', '2030-05-02T18:00:00Z', 3),
      ],
      NOW,
    )
    expect(result.map((s) => s.id)).toEqual(['soon', 'late'])
  })
})

describe('isChoosable / resolveSelectedSlot', () => {
  const slots = [
    slot('full', '2030-05-02T18:00:00Z', 0),
    slot('booked', '2030-05-03T18:00:00Z', 4),
    slot('free', '2030-05-04T18:00:00Z', 2),
    slot('free2', '2030-05-05T18:00:00Z', 5),
  ]
  const active = new Map([['booked', true]])

  it('excludes full dates and dates with a live request', () => {
    expect(slots.map((s) => isChoosable(s, active))).toEqual([false, false, true, true])
  })
  it('keeps the selection when valid, else falls back to the first choosable date', () => {
    expect(resolveSelectedSlot(slots, active, 'free2')?.id).toBe('free2')
    expect(resolveSelectedSlot(slots, active, 'full')?.id).toBe('free')
    expect(resolveSelectedSlot(slots, active, null)?.id).toBe('free')
  })
  it('returns undefined when nothing can be requested', () => {
    expect(resolveSelectedSlot([slots[0]], active, null)).toBeUndefined()
  })
})

describe('clampSeats', () => {
  it('stays within 1 and the available seats', () => {
    expect(clampSeats(4, 2)).toBe(2)
    expect(clampSeats(0, 2)).toBe(1)
    expect(clampSeats(2, 5)).toBe(2)
  })
})

describe('cancelCopy', () => {
  it('withdraws a pending request and cancels a confirmed booking', () => {
    expect(cancelCopy('pending').label).toBe('Ritira la richiesta')
    expect(cancelCopy('confirmed').label).toBe('Disdici')
  })
})
