import { describe, expect, it } from 'vitest'
import { formatPrice, parseEuroToCents } from './format'

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
