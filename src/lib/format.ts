const euro = new Intl.NumberFormat('it-IT', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
})

export function formatPrice(cents: number): string {
  return euro.format(cents / 100)
}

/** "12,50" or "12.5" -> 1250; null if not a valid amount. */
export function parseEuroToCents(value: string): number | null {
  const amount = Number(value.replace(',', '.').trim())
  return value.trim() !== '' && Number.isFinite(amount) && amount >= 0
    ? Math.round(amount * 100)
    : null
}

export function formatSlotDate(iso: string): string {
  return new Date(iso).toLocaleDateString('it-IT', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

export function formatSlotTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })
}

export function formatMonthYear(iso: string): string {
  return new Date(iso).toLocaleDateString('it-IT', { month: 'long', year: 'numeric' })
}

/** Value for <input type="datetime-local" min=...>: now, in local time. */
export function nowForDatetimeInput(): string {
  const now = new Date()
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
  return now.toISOString().slice(0, 16)
}

/** "sabato 24 ottobre": heading of a group of bookings. */
export function formatLongDate(iso: string): string {
  return new Date(iso).toLocaleDateString('it-IT', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

const relativeTime = new Intl.RelativeTimeFormat('it-IT', { numeric: 'auto' })

/** "5 minuti fa", "ieri"; falls back to an absolute date after a week. */
export function formatRelativeDate(iso: string, now: Date = new Date()): string {
  const date = new Date(iso)
  const seconds = Math.round((date.getTime() - now.getTime()) / 1000)
  const abs = Math.abs(seconds)
  if (seconds > 0 || abs < 60) return 'adesso'
  if (abs < 3600) return relativeTime.format(Math.round(seconds / 60), 'minute')
  if (abs < 86_400) return relativeTime.format(Math.round(seconds / 3600), 'hour')
  if (abs < 7 * 86_400) return relativeTime.format(Math.round(seconds / 86_400), 'day')
  return date.toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })
}
