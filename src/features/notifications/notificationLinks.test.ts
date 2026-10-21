import { describe, expect, it } from 'vitest'
import { badgeText, bellLabel, isNavigableLink } from './notificationLinks'

describe('isNavigableLink', () => {
  it('accepts the host requests page', () => {
    expect(isNavigableLink('/pasti/abc-123/richieste')).toBe(true)
  })
  it('rejects pages that do not exist yet and unsafe values', () => {
    expect(isNavigableLink('/prenotazioni')).toBe(false)
    expect(isNavigableLink('//evil.example/pasti/x/richieste')).toBe(false)
    expect(isNavigableLink('https://evil.example')).toBe(false)
    expect(isNavigableLink(null)).toBe(false)
  })
})

describe('badgeText', () => {
  it('hides the badge at zero', () => {
    expect(badgeText(0)).toBeNull()
  })
  it('caps at 99+', () => {
    expect(badgeText(1)).toBe('1')
    expect(badgeText(99)).toBe('99')
    expect(badgeText(100)).toBe('99+')
  })
})

describe('bellLabel', () => {
  it('describes the unread count', () => {
    expect(bellLabel(0)).toBe('Notifiche, 0 non lette')
    expect(bellLabel(1)).toBe('Notifiche, 1 non letta')
    expect(bellLabel(3)).toBe('Notifiche, 3 non lette')
  })
})
