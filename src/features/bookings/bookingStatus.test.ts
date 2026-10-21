import { describe, expect, it } from 'vitest'
import {
  BOOKING_STATUS_LABELS,
  bookingStatusLabel,
  cancellationLabel,
  formatSeats,
  seatOptions,
} from './bookingStatus'

describe('BOOKING_STATUS_LABELS', () => {
  it('has an Italian label for every status', () => {
    expect(BOOKING_STATUS_LABELS).toEqual({
      pending: 'In attesa',
      confirmed: 'Confermata',
      declined: 'Rifiutata',
      cancelled: 'Annullata',
      expired: 'Scaduta',
    })
  })
})

describe('formatSeats', () => {
  it('pluralizes', () => {
    expect(formatSeats(1)).toBe('1 posto')
    expect(formatSeats(2)).toBe('2 posti')
    expect(formatSeats(0)).toBe('0 posti')
  })
})

describe('seatOptions', () => {
  it('is empty without seats', () => {
    expect(seatOptions(0)).toEqual([])
    expect(seatOptions(-3)).toEqual([])
  })
  it('lists 1..available', () => {
    expect(seatOptions(1)).toEqual([1])
    expect(seatOptions(3)).toEqual([1, 2, 3])
  })
  it('caps at 50', () => {
    expect(seatOptions(50)).toHaveLength(50)
    expect(seatOptions(80)).toHaveLength(50)
    expect(seatOptions(80).at(-1)).toBe(50)
  })
})

describe('cancellationLabel', () => {
  it('says who cancelled', () => {
    expect(cancellationLabel('guest', false)).toBe('Annullata dall’ospite')
    expect(cancellationLabel('host', false)).toBe('Annullata dall’host')
    expect(cancellationLabel(null, false)).toBe('Annullata')
  })
  it('flags late cancellations', () => {
    expect(cancellationLabel('guest', true)).toBe('Annullata dall’ospite (disdetta tardiva)')
  })
})

describe('bookingStatusLabel', () => {
  it('uses the plain label unless cancelled', () => {
    expect(
      bookingStatusLabel({ status: 'pending', cancelled_by: null, cancelled_late: false }),
    ).toBe('In attesa')
    expect(
      bookingStatusLabel({ status: 'cancelled', cancelled_by: 'host', cancelled_late: false }),
    ).toBe('Annullata dall’host')
  })
})
