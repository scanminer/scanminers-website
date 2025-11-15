import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

vi.mock('contentlayer/generated', () => ({
  allBrandGuides: [
    { slug: 'messaging', title: 'Messaging Framework', _raw: { sourceFilePath: 'brand/messaging.mdx' } },
  ],
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

vi.mock('fs/promises', () => ({
  default: {
    readFile: vi.fn(),
  },
}))

vi.mock('@/lib/github', () => ({
  getOctokit: vi.fn(() => ({ label: 'mock-octokit' })),
  getDefaultBranchSha: vi.fn(async () => 'base-sha'),
  createBranchFrom: vi.fn(async () => {}),
  getFileContent: vi.fn(async () => {
    const err = new Error('Not Found') as Error & { status?: number }
    err.status = 404
    throw err
  }),
  commitFile: vi.fn(async () => ({})),
  openPr: vi.fn(async () => 'https://example.com/pr/42'),
}))

describe('updateBrandSection', () => {
  beforeEach(async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-03-18T10:20:30.000Z'))
    
    const fs = await import('fs/promises')
    const { commitFile, openPr, createBranchFrom, getDefaultBranchSha, getFileContent } = await import('@/lib/github')
    
    vi.mocked(fs.default.readFile).mockResolvedValue(`---
title: Messaging Framework
summary: Original summary
status: draft
keywords:
  - legacy
---

Legacy body
`)
    vi.mocked(commitFile).mockClear()
    vi.mocked(openPr).mockClear()
    vi.mocked(createBranchFrom).mockClear()
    vi.mocked(getDefaultBranchSha).mockClear()
    vi.mocked(getFileContent).mockClear()
    
    process.env.GH_REPO = 'scanminer/scanminers-website'
    process.env.CONTENT_BOT_TOKEN = 'test-token'
    process.env.GIT_DEFAULT_BRANCH = 'main'
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('writes updated MDX via GitHub and returns PR url', async () => {
    const { updateBrandSection } = await import('../../app/admin/brand/actions')
    const { commitFile, openPr, getDefaultBranchSha, createBranchFrom } = await import('@/lib/github')
    
    const formData = new FormData()
    formData.set('slug', 'messaging')
    formData.set('title', 'Messaging Framework v2')
    formData.set('summary', 'Updated summary for QA flow')
    formData.set('status', 'approved')
    formData.set('heroTagline', 'Hero line')
    formData.set('elevatorPitch', 'Elevator pitch copy')
    formData.set('keywords', 'one, two')
    formData.set('checklist', 'alpha\nbeta')
    formData.set('updatedBy', 'qa-bot')
    formData.set('body', '## New body copy for automated test')

    const result = await updateBrandSection({ ok: true }, formData)

    expect(result).toEqual({ ok: true, prUrl: 'https://example.com/pr/42' })
    expect(getDefaultBranchSha).toHaveBeenCalled()
    expect(createBranchFrom).toHaveBeenCalled()
    expect(commitFile).toHaveBeenCalledTimes(1)
    expect(openPr).toHaveBeenCalled()
    
    const commitCalls = vi.mocked(commitFile).mock.calls
    expect(commitCalls[0][2]).toBe('content/brand/messaging.mdx')
    expect(commitCalls[0][3]).toContain('Updated summary for QA flow')
    expect(commitCalls[0][4]).toContain('messaging')
  })
})
