import { describe, expect, it } from 'vitest'
import { groupByStart, matchesTab, scopeForTab } from './requestFilters'

describe('matchesTab', () => {
  it('matches pending and confirmed exactly', () => {
    expect(matchesTab('pending', 'pending')).toBe(true)
    expect(matchesTab('confirmed', 'pending')).toBe(false)
    expect(matchesTab('confirmed', 'confirmed')).toBe(true)
  })
  it('groups the remaining statuses under "other"', () => {
    for (const status of ['declined', 'cancelled', 'expired'] as const) {
      expect(matchesTab(status, 'other')).toBe(true)
    }
    expect(matchesTab('pending', 'other')).toBe(false)
    expect(matchesTab('confirmed', 'other')).toBe(false)
  })
  it('shows everything in the past tab', () => {
    expect(matchesTab('declined', 'past')).toBe(true)
  })
})

describe('scopeForTab', () => {
  it('uses the past scope only for the past tab', () => {
    expect(scopeForTab('past')).toBe('past')
    expect(scopeForTab('pending')).toBe('upcoming')
  })
})

describe('groupByStart', () => {
  it('returns no groups for an empty list', () => {
    expect(groupByStart([])).toEqual([])
  })
  it('groups consecutive items with the same start', () => {
    const a1 = { starts_at: 'A', n: 1 }
    const a2 = { starts_at: 'A', n: 2 }
    const b = { starts_at: 'B', n: 3 }
    expect(groupByStart([a1, a2, b])).toEqual([
      { startsAt: 'A', items: [a1, a2] },
      { startsAt: 'B', items: [b] },
    ])
  })
})
