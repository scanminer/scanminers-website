"use client"

import { useActionState, useEffect, useMemo, useRef, useState } from "react"
import { updateBrandSection } from "@/app/admin/brand/actions"
import type { BrandGuardrailEntry, BrandPromptEntry } from "@/lib/brand-content"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export type BrandAdminSection = {
  slug: string
  title: string
  category: string
  summary: string
  status: "draft" | "approved"
  heroTagline?: string | null
  elevatorPitch?: string | null
  keywords: string[]
  checklist: string[]
  updatedAt?: string | null
  updatedBy?: string | null
  body: string
}

type Props = {
  sections: BrandAdminSection[]
  guardrails: Array<BrandGuardrailEntry & { section: string }>
  prompts: Array<BrandPromptEntry & { section: string }>
  systemPrompt: string
}

type DraftState = {
  slug: string
  title: string
  summary: string
  heroTagline: string
  elevatorPitch: string
  keywords: string
  checklist: string
  status: "draft" | "approved"
  updatedBy: string
  body: string
}

type ActionState = { ok: boolean; error?: string; prUrl?: string }

const emptyActionState: ActionState = { ok: true }

export function BrandPortal({ sections, guardrails, prompts, systemPrompt }: Props) {
  const [activeTab, setActiveTab] = useState<"overview" | "editor" | "ai">("overview")
  const [selectedSlug, setSelectedSlug] = useState(() => sections[0]?.slug ?? "")
  const sectionMap = useMemo(() => new Map(sections.map((section) => [section.slug, section])), [sections])
  const selectedSection = sectionMap.get(selectedSlug) ?? sections[0]

  const [draft, setDraft] = useState<DraftState>(() => mapSectionToDraft(selectedSection))

  useEffect(() => {
    setDraft(mapSectionToDraft(selectedSection))
  }, [selectedSection])

  const [actionState, formAction, isPending] = useActionState<ActionState, FormData>(updateBrandSection, emptyActionState)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [statusVariant, setStatusVariant] = useState<"success" | "error">("success")
  const [statusLink, setStatusLink] = useState<string | null>(null)
  const firstRunRef = useRef(true)

  useEffect(() => {
    if (firstRunRef.current) {
      firstRunRef.current = false
      return
    }
    if (actionState.ok) {
      setStatusVariant("success")
      setStatusMessage(actionState.prUrl ? "Brand section saved via GitHub PR." : "Brand section saved successfully.")
      setStatusLink(actionState.prUrl ?? null)
    } else {
      setStatusVariant("error")
      setStatusMessage(actionState.error || "Unable to save brand section.")
      setStatusLink(null)
    }
  }, [actionState])

  useEffect(() => {
    setStatusMessage(null)
    setStatusLink(null)
  }, [selectedSlug])

  if (!selectedSection) {
    return <p className="text-sm text-muted-foreground">No brand sections found. Add MDX files under content/brand.</p>
  }

  const publishedCount = sections.filter((section) => section.status === "approved").length
  const draftCount = sections.length - publishedCount
  const categoryCount = new Set(sections.map((section) => section.category)).size

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Brand System</h1>
        <p className="text-muted-foreground">Manage the Scanminers brand book, guardrails, and AI guidance directly from the admin portal.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Approved sections" value={publishedCount} helper="Included in AI + public surfaces" />
        <StatCard label="Draft sections" value={draftCount} helper="Review before enabling" />
        <StatCard label="Brand categories" value={categoryCount} helper="Foundation · Messaging · Voice · Visual · Evidence · Playbooks" />
      </div>

      <TabList activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === "overview" ? (
        <OverviewTab sections={sections} guardrails={guardrails} prompts={prompts} />
      ) : null}

      {activeTab === "editor" ? (
        <EditorTab
          sections={sections}
          selectedSlug={selectedSlug}
          onSelect={setSelectedSlug}
          draft={draft}
          setDraft={setDraft}
          formAction={formAction}
          isPending={isPending}
          statusMessage={statusMessage}
          statusVariant={statusVariant}
          statusLink={statusLink}
        />
      ) : null}

      {activeTab === "ai" ? (
        <AiTab systemPrompt={systemPrompt} guardrails={guardrails} prompts={prompts} />
      ) : null}
    </div>
  )
}

function mapSectionToDraft(section?: BrandAdminSection): DraftState {
  if (!section) {
    return {
      slug: "",
      title: "",
      summary: "",
      heroTagline: "",
      elevatorPitch: "",
      keywords: "",
      checklist: "",
      status: "draft",
      updatedBy: "",
      body: "",
    }
  }

  return {
    slug: section.slug,
    title: section.title,
    summary: section.summary,
    heroTagline: section.heroTagline || "",
    elevatorPitch: section.elevatorPitch || "",
    keywords: section.keywords.join(", "),
    checklist: section.checklist.join("\n"),
    status: section.status,
    updatedBy: section.updatedBy || "",
    body: section.body,
  }
}

function StatCard({ label, value, helper }: { label: string; value: number; helper: string }) {
  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
      <p className="text-xs text-muted-foreground">{helper}</p>
    </div>
  )
}

function TabList({
  activeTab,
  onChange,
}: {
  activeTab: "overview" | "editor" | "ai"
  onChange: (tab: "overview" | "editor" | "ai") => void
}) {
  const options: Array<{ key: "overview" | "editor" | "ai"; label: string; helper: string }> = [
    { key: "overview", label: "Overview", helper: "Status + guardrails" },
    { key: "editor", label: "Editor", helper: "Update MDX sections" },
    { key: "ai", label: "AI Guide", helper: "Prompt + context" },
  ]

  return (
    <div className="flex flex-wrap gap-3">
      {options.map((option) => (
        <button
          key={option.key}
          type="button"
          onClick={() => onChange(option.key)}
          className={`rounded-2xl border px-4 py-2 text-left transition ${
            activeTab === option.key ? "border-foreground bg-foreground/5" : "border-border bg-card hover:bg-card/80"
          }`}
        >
          <p className="font-medium">{option.label}</p>
          <p className="text-xs text-muted-foreground">{option.helper}</p>
        </button>
      ))}
    </div>
  )
}

function OverviewTab({
  sections,
  guardrails,
  prompts,
}: {
  sections: BrandAdminSection[]
  guardrails: Array<BrandGuardrailEntry & { section: string }>
  prompts: Array<BrandPromptEntry & { section: string }>
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-2xl border bg-card p-5 shadow-sm">
        <h2 className="text-lg font-semibold">Sections</h2>
        <div className="mt-4 space-y-3">
          {sections.map((section) => (
            <div key={section.slug} className="rounded-xl border px-4 py-3">
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium">{section.title}</p>
                <span
                  className={`rounded-full px-3 py-0.5 text-xs font-medium ${
                    section.status === "approved"
                      ? "bg-emerald-100/70 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
                      : "bg-amber-100/70 text-amber-700 dark:bg-amber-500/10 dark:text-amber-200"
                  }`}
                >
                  {section.status}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{section.summary}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <h2 className="text-lg font-semibold">Guardrails</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {guardrails.slice(0, 6).map((guardrail, index) => (
              <li key={`${guardrail.rule}-${index}`} className="rounded-xl border px-4 py-3">
                <p className="font-medium">{guardrail.rule}</p>
                {guardrail.reason ? <p className="text-muted-foreground">{guardrail.reason}</p> : null}
                {guardrail.severity ? (
                  <p className="text-xs text-muted-foreground">Severity: {guardrail.severity}</p>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <h2 className="text-lg font-semibold">Prompt Snippets</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {prompts.slice(0, 5).map((prompt, index) => (
              <li key={`${prompt.name}-${index}`} className="rounded-xl border px-4 py-3">
                <p className="font-medium">{prompt.name}</p>
                <p className="text-muted-foreground">{prompt.instructions}</p>
                {prompt.tags?.length ? (
                  <p className="text-xs text-muted-foreground">Tags: {prompt.tags.join(", ")}</p>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

function EditorTab({
  sections,
  selectedSlug,
  onSelect,
  draft,
  setDraft,
  formAction,
  isPending,
  statusMessage,
  statusVariant,
  statusLink,
}: {
  sections: BrandAdminSection[]
  selectedSlug: string
  onSelect: (slug: string) => void
  draft: DraftState
  setDraft: (draft: DraftState) => void
  formAction: (formData: FormData) => void
  isPending: boolean
  statusMessage: string | null
  statusVariant: "success" | "error"
  statusLink: string | null
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
      <div className="rounded-2xl border bg-card p-3 shadow-sm">
        <p className="px-2 text-xs font-medium uppercase text-muted-foreground">Brand sections</p>
        <div className="mt-2 space-y-1">
          {sections.map((section) => (
            <button
              key={section.slug}
              type="button"
              onClick={() => onSelect(section.slug)}
              className={`w-full rounded-xl px-3 py-2 text-left text-sm transition ${
                selectedSlug === section.slug ? "bg-foreground/10 font-semibold" : "hover:bg-muted"
              }`}
            >
              <p>{section.title}</p>
              <p className="text-xs text-muted-foreground">{section.category}</p>
            </button>
          ))}
        </div>
      </div>

      <form action={formAction} className="rounded-2xl border bg-card p-5 shadow-sm space-y-4">
        <input type="hidden" name="slug" value={draft.slug} />
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-xs font-semibold text-muted-foreground">Title</label>
            <Input name="title" value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground">Status</label>
            <select
              name="status"
              value={draft.status}
              onChange={(event) => setDraft({ ...draft, status: event.target.value as DraftState["status"] })}
              className="mt-1 w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm"
            >
              <option value="approved">Approved</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-xs font-semibold text-muted-foreground">Hero tagline</label>
            <Input
              name="heroTagline"
              value={draft.heroTagline}
              onChange={(event) => setDraft({ ...draft, heroTagline: event.target.value })}
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground">Elevator pitch</label>
            <Input
              name="elevatorPitch"
              value={draft.elevatorPitch}
              onChange={(event) => setDraft({ ...draft, elevatorPitch: event.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-muted-foreground">Summary</label>
          <Textarea
            name="summary"
            value={draft.summary}
            onChange={(event) => setDraft({ ...draft, summary: event.target.value })}
            rows={3}
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-muted-foreground">Keywords (comma separated)</label>
          <Input
            name="keywords"
            value={draft.keywords}
            onChange={(event) => setDraft({ ...draft, keywords: event.target.value })}
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-muted-foreground">Checklist (one per line)</label>
          <Textarea
            name="checklist"
            value={draft.checklist}
            onChange={(event) => setDraft({ ...draft, checklist: event.target.value })}
            rows={4}
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-muted-foreground">Updated by</label>
          <Input
            name="updatedBy"
            value={draft.updatedBy}
            onChange={(event) => setDraft({ ...draft, updatedBy: event.target.value })}
            placeholder="Person or process"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-muted-foreground">MDX body</label>
          <Textarea
            name="body"
            value={draft.body}
            onChange={(event) => setDraft({ ...draft, body: event.target.value })}
            rows={16}
            className="font-mono text-xs"
          />
        </div>

        <div className="flex items-center justify-between gap-3">
          {statusMessage ? (
            <p className={`text-sm ${statusVariant === "success" ? "text-emerald-600" : "text-red-600"}`}>
              {statusMessage}
              {statusLink ? (
                <>
                  {' '}
                  <a className="underline" href={statusLink} target="_blank" rel="noreferrer">
                    View PR
                  </a>
                </>
              ) : null}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">Saves open a GitHub PR for this section.</p>
          )}
          <Button type="submit" disabled={isPending || !draft.slug}>
            {isPending ? "Saving..." : "Save brand section"}
          </Button>
        </div>
      </form>
    </div>
  )
}

function AiTab({
  systemPrompt,
  guardrails,
  prompts,
}: {
  systemPrompt: string
  guardrails: Array<BrandGuardrailEntry & { section: string }>
  prompts: Array<BrandPromptEntry & { section: string }>
}) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(systemPrompt)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-2xl border bg-card p-5 shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg font-semibold">System prompt</h2>
          <Button type="button" variant="outline" size="sm" onClick={handleCopy}>
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>
        <pre className="mt-4 max-h-[420px] overflow-auto rounded-xl bg-muted px-4 py-3 text-xs leading-relaxed">
          {systemPrompt}
        </pre>
      </div>

      <div className="space-y-4">
        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <h3 className="text-base font-semibold">Guardrails</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {guardrails.map((guardrail, index) => (
              <li key={`${guardrail.rule}-${index}`} className="rounded-xl border px-3 py-2">
                <p className="font-medium">{guardrail.rule}</p>
                {guardrail.reason ? <p className="text-muted-foreground">{guardrail.reason}</p> : null}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <h3 className="text-base font-semibold">Prompt library</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {prompts.map((prompt, index) => (
              <li key={`${prompt.name}-${index}`} className="rounded-xl border px-3 py-2">
                <p className="font-medium">{prompt.name}</p>
                <p className="text-muted-foreground">{prompt.instructions}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
