import { describe, it, expect } from 'vitest'
import { isContentVisible, filterVisibleContent } from '../../lib/content-filters'

describe('isContentVisible', () => {
  describe('published content', () => {
    it('shows content with status="published"', () => {
      expect(isContentVisible({ status: 'published' })).toBe(true)
    })

    it('shows content with missing status (backward compatibility)', () => {
      expect(isContentVisible({})).toBe(true)
    })
  })

  describe('scheduled content', () => {
    it('shows scheduled content with past publishAt date', () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      
      expect(isContentVisible({
        status: 'scheduled',
        publishAt: yesterday.toISOString(),
      })).toBe(true)
    })

    it('hides scheduled content with future publishAt date', () => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      
      expect(isContentVisible({
        status: 'scheduled',
        publishAt: tomorrow.toISOString(),
      })).toBe(false)
    })

    it('hides scheduled content without publishAt date', () => {
      expect(isContentVisible({ status: 'scheduled' })).toBe(false)
    })

    it('hides scheduled content with invalid publishAt date', () => {
      expect(isContentVisible({
        status: 'scheduled',
        publishAt: 'not-a-date',
      })).toBe(false)
    })
  })

  describe('draft and review content', () => {
    it('hides content with status="draft"', () => {
      expect(isContentVisible({ status: 'draft' })).toBe(false)
    })

    it('hides content with status="review"', () => {
      expect(isContentVisible({ status: 'review' })).toBe(false)
    })
  })
})

describe('filterVisibleContent', () => {
  it('filters array to only visible content', () => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)

    const entries = [
      { id: 1, status: 'published' },
      { id: 2, status: 'draft' },
      { id: 3, status: 'scheduled', publishAt: yesterday.toISOString() },
      { id: 4, status: 'scheduled', publishAt: tomorrow.toISOString() },
      { id: 5 }, // missing status (should show)
    ]

    const visible = filterVisibleContent(entries)
    
    expect(visible).toHaveLength(3)
    expect(visible.map(e => e.id)).toEqual([1, 3, 5])
  })

  it('returns empty array when all content is hidden', () => {
    const entries = [
      { status: 'draft' },
      { status: 'review' },
    ]

    expect(filterVisibleContent(entries)).toEqual([])
  })

  it('preserves order of filtered content', () => {
    const entries = [
      { id: 3, status: 'published' },
      { id: 1, status: 'draft' },
      { id: 2, status: 'published' },
    ]

    const visible = filterVisibleContent(entries)
    
    expect(visible.map(e => e.id)).toEqual([3, 2])
  })
})
