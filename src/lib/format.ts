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
