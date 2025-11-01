import { describe, it, expect } from 'vitest'
import { formatDate } from '../../lib/date'

describe('formatDate', () => {
  it('formats ISO date strings as Month D, YYYY (UTC)', () => {
    expect(formatDate('2025-11-01')).toBe('November 1, 2025')
  })

  it('returns empty string for invalid dates', () => {
    expect(formatDate('not-a-date')).toBe('')
  })
})
