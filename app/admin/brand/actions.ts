'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import fs from 'fs/promises'
import path from 'path'
import matter from 'gray-matter'
import { allBrandGuides } from 'contentlayer/generated'
import {
  commitFile,
  createBranchFrom,
  getDefaultBranchSha,
  getFileContent,
  getOctokit,
  openPr,
} from '@/lib/github'
import { requireAdminSession } from '@/lib/admin-session'

const UpdateBrandSectionSchema = z.object({
  slug: z.string().min(2),
  title: z.string().min(4),
  summary: z.string().min(10),
  status: z.enum(['draft', 'approved']),
  heroTagline: z.string().optional(),
  elevatorPitch: z.string().optional(),
  keywords: z.string().optional(),
  checklist: z.string().optional(),
  updatedBy: z.string().optional(),
  body: z.string().min(10),
})

type BrandDocMeta = {
  absolutePath: string
  repoPath: string
  title: string
}

function resolveBrandDoc(slug: string): BrandDocMeta {
  const doc = allBrandGuides.find((section) => section.slug === slug) as
    | (typeof allBrandGuides[number] & { _raw?: { sourceFilePath?: string } })
    | undefined
  if (!doc) throw new Error(`Unable to find brand section for slug ${slug}`)
  const rawPath = doc._raw?.sourceFilePath
  if (!rawPath) throw new Error(`Cannot resolve source path for ${slug}`)
  const normalized = rawPath.replace(/\\/g, '/')
  return {
    absolutePath: path.join(process.cwd(), 'content', rawPath),
    repoPath: path.posix.join('content', normalized),
    title: doc.title,
  }
}

async function persistBrandDoc({
  slug,
  repoPath,
  content,
  title,
  summary,
  updatedBy,
}: {
  slug: string
  repoPath: string
  content: string
  title: string
  summary: string
  updatedBy: string
}) {
  const repo = process.env.GH_REPO || process.env.CONTENT_REPO
  if (!repo) throw new Error('Missing GH_REPO or CONTENT_REPO environment variable')
  const base = process.env.GIT_DEFAULT_BRANCH || process.env.CONTENT_DEFAULT_BRANCH || 'main'
  const octokit = getOctokit()
  const timestamp = new Date().toISOString().replace(/[:.]/g, '').slice(0, 15)
  const branchName = `brand/${slug}-${timestamp}`

  const baseSha = await getDefaultBranchSha(octokit, repo, base)
  await createBranchFrom(octokit, repo, branchName, baseSha)

  let sha: string | undefined
  try {
    const file = await getFileContent(octokit, repo, repoPath, branchName)
    sha = file.sha
  } catch (error) {
    // Ignore missing file errors so createOrUpdate can create it
    if (!(error as { status?: number })?.status || (error as { status?: number }).status !== 404) {
      throw error
    }
  }

  await commitFile(octokit, repo, repoPath, content, `chore(brand): update ${slug}`, branchName, sha)

  const body = [
    `## Brand section update`,
    '',
    `- Section: **${title}** (${slug})`,
    `- Summary: ${summary}`,
    `- Updated by: ${updatedBy}`,
    '',
    'Automated commit from the Admin Brand Portal.',
  ].join('\n')

  const prUrl = await openPr(octokit, repo, branchName, base, `Update brand section – ${title}`, body)
  return { prUrl, branch: branchName }
}

export async function updateBrandSection(prevState: { ok: boolean; error?: string }, formData: FormData) {
  try {
    await requireAdminSession()
    const payload = UpdateBrandSectionSchema.parse({
      slug: formData.get('slug')?.toString(),
      title: formData.get('title')?.toString(),
      summary: formData.get('summary')?.toString(),
      status: formData.get('status')?.toString(),
      heroTagline: formData.get('heroTagline')?.toString(),
      elevatorPitch: formData.get('elevatorPitch')?.toString(),
      keywords: formData.get('keywords')?.toString(),
      checklist: formData.get('checklist')?.toString(),
      updatedBy: formData.get('updatedBy')?.toString(),
      body: formData.get('body')?.toString(),
    })

  const docMeta = resolveBrandDoc(payload.slug)
  const current = await fs.readFile(docMeta.absolutePath, 'utf8')
    const parsed = matter(current)

    const keywords = payload.keywords
      ? payload.keywords
          .split(',')
          .map((word) => word.trim())
          .filter(Boolean)
      : (Array.isArray(parsed.data.keywords) ? parsed.data.keywords : [])

    const checklist = payload.checklist
      ? payload.checklist
          .split('\n')
          .map((line) => line.trim())
          .filter(Boolean)
      : (Array.isArray(parsed.data.checklist) ? parsed.data.checklist : [])

    const updated = {
      ...parsed.data,
      title: payload.title,
      summary: payload.summary,
      status: payload.status,
      heroTagline: payload.heroTagline || undefined,
      elevatorPitch: payload.elevatorPitch || undefined,
      keywords,
      checklist,
      updatedBy: payload.updatedBy || 'admin-portal',
      updatedAt: new Date().toISOString().slice(0, 10),
    }

    const nextBody = payload.body.endsWith('\n') ? payload.body : `${payload.body}\n`
    const nextMdx = matter.stringify(nextBody, updated)
    const { prUrl } = await persistBrandDoc({
      slug: payload.slug,
      repoPath: docMeta.repoPath,
      content: nextMdx,
      title: payload.title,
      summary: payload.summary,
      updatedBy: updated.updatedBy,
    })

    revalidatePath('/admin/brand')
    return { ok: true, prUrl }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return { ok: false, error: message }
  }
}
