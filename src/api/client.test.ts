import { describe, expect, it } from 'vitest'
import { API_URL } from './client'

describe('api client', () => {
  it('has a base URL', () => {
    expect(API_URL).toMatch(/^https?:\/\//)
  })
})
