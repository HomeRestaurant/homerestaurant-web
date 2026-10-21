// Pages a notification may point to: the host requests of a meal and the guest bookings
const NAVIGABLE_LINKS = [/^\/pasti\/[^/]+\/richieste$/, /^\/prenotazioni$/]

/** True if the link is an in-app path that exists, so a click can't land on a blank page. */
export function isNavigableLink(link: string | null | undefined): link is string {
  return !!link && NAVIGABLE_LINKS.some((pattern) => pattern.test(link))
}

/** "99+" above 99; null when there is nothing to show. */
export function badgeText(count: number): string | null {
  if (count <= 0) return null
  return count > 99 ? '99+' : String(count)
}

export function bellLabel(count: number): string {
  return `Notifiche, ${count} ${count === 1 ? 'non letta' : 'non lette'}`
}
