import type { BookingScope, BookingStatus } from '../../api/client'

export type RequestTab = 'pending' | 'confirmed' | 'other' | 'past'

export const REQUEST_TAB_LABELS: Record<RequestTab, string> = {
  pending: 'In attesa',
  confirmed: 'Confermate',
  other: 'Altre',
  past: 'Passate',
}

/** Past dates come from the "past" scope; the other tabs slice the upcoming ones. */
export function scopeForTab(tab: RequestTab): BookingScope {
  return tab === 'past' ? 'past' : 'upcoming'
}

export function matchesTab(status: BookingStatus, tab: RequestTab): boolean {
  if (tab === 'past') return true
  if (tab === 'other') return status !== 'pending' && status !== 'confirmed'
  return status === tab
}

/** Group consecutive items sharing the same start time (the list is already sorted by date). */
export function groupByStart<T extends { starts_at: string }>(
  items: T[],
): { startsAt: string; items: T[] }[] {
  const groups: { startsAt: string; items: T[] }[] = []
  for (const item of items) {
    const last = groups.at(-1)
    if (last && last.startsAt === item.starts_at) last.items.push(item)
    else groups.push({ startsAt: item.starts_at, items: [item] })
  }
  return groups
}
