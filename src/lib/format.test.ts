import { describe, expect, it } from 'vitest'
import { formatPrice, formatRelativeDate, parseEuroToCents } from './format'

describe('parseEuroToCents', () => {
  it.each([
    ['25', 2500],
    ['12,50', 1250],
    ['12.5', 1250],
    ['0', 0],
  ])('parses %s', (input, expected) => {
    expect(parseEuroToCents(input)).toBe(expected)
  })

  it.each(['', 'abc', '-3'])('rejects %s', (input) => {
    expect(parseEuroToCents(input)).toBeNull()
  })
})

describe('formatPrice', () => {
  it('formats euro cents', () => {
    expect(formatPrice(2500).replace(/\s/g, ' ')).toBe('25 €')
    expect(formatPrice(1250).replace(/\s/g, ' ')).toBe('12,5 €')
  })
})

describe('formatRelativeDate', () => {
  const now = new Date('2026-10-21T12:00:00Z')
  const ago = (ms: number) => new Date(now.getTime() - ms).toISOString()

  it('says "adesso" for the last minute and for clock skew', () => {
    expect(formatRelativeDate(ago(30_000), now)).toBe('adesso')
    expect(formatRelativeDate(ago(-5_000), now)).toBe('adesso')
  })
  it('uses minutes, hours and days', () => {
    expect(formatRelativeDate(ago(5 * 60_000), now)).toBe('5 minuti fa')
    expect(formatRelativeDate(ago(3 * 3_600_000), now)).toBe('3 ore fa')
    expect(formatRelativeDate(ago(86_400_000), now)).toBe('ieri')
  })
  it('switches to an absolute date after a week', () => {
    expect(formatRelativeDate(ago(8 * 86_400_000), now)).toBe('13 ottobre 2026')
  })
})
