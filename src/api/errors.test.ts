import { describe, expect, it } from 'vitest'
import { toApiError } from './errors'

describe('toApiError', () => {
  it('uses a string detail as message', () => {
    const error = toApiError(409, { detail: 'Esiste già un account con questa email' })
    expect(error.status).toBe(409)
    expect(error.message).toBe('Esiste già un account con questa email')
  })

  it('joins validation messages', () => {
    const error = toApiError(422, { detail: [{ msg: 'Uno' }, { msg: 'Due' }] })
    expect(error.message).toBe('Uno. Due')
  })

  it('falls back to a generic message', () => {
    expect(toApiError(500, undefined).message).toBe('Qualcosa è andato storto, riprova.')
  })
})
