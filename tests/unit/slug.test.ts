import { describe, it, expect } from 'vitest'
import { slugifyTag } from '../../lib/slug'

describe('slugifyTag', () => {
  it('lowercases, trims, replaces spaces/underscores with hyphens', () => {
    expect(slugifyTag('  Hello_World Test ')).toBe('hello-world-test')
  })

  it('removes non-alphanumeric characters and squashes hyphens', () => {
    expect(slugifyTag('A!@#$%^&*()_B--C')).toBe('a-b-c')
  })

  it('trims leading/trailing hyphens', () => {
    expect(slugifyTag('-a-b-c-')).toBe('a-b-c')
  })
})
