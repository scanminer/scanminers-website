"use client";

import { useState, useActionState, useEffect, useRef } from "react";
import type { Insight, CaseStudy } from "contentlayer/generated";
import type { ContentType, ContentFrontmatter } from "@/app/admin/editor/actions";
import { saveContentDraftViaGit, publishContentViaGit } from "@/app/admin/editor/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type EditorPortalProps = {
  content: Insight | CaseStudy;
  contentType: ContentType;
};

type ActiveTab = "content" | "preview" | "social";

type DraftState = {
  slug: string;
  title: string;
  publishedAt: string;
  region: string;
  summary: string;
  commodity: string;
  tags: string;
  image: string;
  imageAlt: string;
  imagePrompt: string;
  review_status: "needs-review" | "approved";
  ai_generated: boolean;
  status: "draft" | "review" | "scheduled" | "published";
  publishAt: string;
  body: string;
};

type ActionResponse = { ok: boolean; error?: string; prUrl?: string };

const emptyActionState: ActionResponse = { ok: true };

function contentToDraft(content: Insight | CaseStudy): DraftState {
  const commodities = "commodities" in content ? content.commodities : [];
  const status = "status" in content && content.status ? content.status : "published";
  const publishAt = "publishAt" in content && content.publishAt ? content.publishAt : "";
  
  return {
    slug: content.slug,
    title: content.title,
    publishedAt: content.publishedAt,
    region: content.region,
    summary: content.summary,
    commodity: Array.isArray(commodities) ? commodities.join(", ") : String(commodities || ""),
    tags: content.tags.join(", "),
    image: content.image,
    imageAlt: content.imageAlt || "",
    imagePrompt: content.imagePrompt,
    review_status: content.review_status,
    ai_generated: content.ai_generated || false,
    status: status as "draft" | "review" | "scheduled" | "published",
    publishAt: String(publishAt),
    body: content.body.raw,
  };
}

export function EditorPortal({ content, contentType }: EditorPortalProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>("content");
  const [draft, setDraft] = useState<DraftState>(() => contentToDraft(content));
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusVariant, setStatusVariant] = useState<"success" | "error">("success");
  const [statusLink, setStatusLink] = useState<string | null>(null);
  
  const [saveState, saveAction, isSaving] = useActionState<ActionResponse, FormData>(
    async () => {
      const frontmatter: ContentFrontmatter = {
        slug: draft.slug,
        title: draft.title,
        publishedAt: draft.publishedAt,
        region: draft.region,
        summary: draft.summary,
        commodity: draft.commodity.split(",").map((c) => c.trim()).filter(Boolean),
        tags: draft.tags.split(",").map((t) => t.trim()).filter(Boolean),
        image: draft.image,
        imageAlt: draft.imageAlt || undefined,
        imagePrompt: draft.imagePrompt,
        review_status: draft.review_status,
        ai_generated: draft.ai_generated,
        status: draft.status,
        publishAt: draft.publishAt || undefined,
      };
      
      return saveContentDraftViaGit(contentType, draft.slug, frontmatter, draft.body);
    },
    emptyActionState
  );
  
  const [publishState, publishAction, isPublishing] = useActionState<ActionResponse, FormData>(
    async () => {
      const frontmatter: ContentFrontmatter = {
        slug: draft.slug,
        title: draft.title,
        publishedAt: draft.publishedAt,
        region: draft.region,
        summary: draft.summary,
        commodity: draft.commodity.split(",").map((c) => c.trim()).filter(Boolean),
        tags: draft.tags.split(",").map((t) => t.trim()).filter(Boolean),
        image: draft.image,
        imageAlt: draft.imageAlt || undefined,
        imagePrompt: draft.imagePrompt,
        review_status: draft.review_status,
        ai_generated: draft.ai_generated,
        status: "published",
        publishAt: undefined,
      };
      
      return publishContentViaGit(contentType, draft.slug, frontmatter, draft.body);
    },
    emptyActionState
  );
  
  const firstRunRef = useRef(true);
  
  useEffect(() => {
    if (firstRunRef.current) {
      firstRunRef.current = false;
      return;
    }
    
    const state = isSaving ? saveState : publishState;
    if (state.ok) {
      setStatusVariant("success");
      setStatusMessage(state.prUrl ? "Content saved via GitHub PR." : "Content saved successfully.");
      setStatusLink(state.prUrl ?? null);
    } else {
      setStatusVariant("error");
      setStatusMessage(state.error || "Unable to save content.");
      setStatusLink(null);
    }
  }, [saveState, publishState, isSaving]);

  return (
    <div className="space-y-6">
      <TabList activeTab={activeTab} onChange={setActiveTab} />

      {statusMessage && (
        <div
          className={`rounded-xl border px-4 py-3 ${
            statusVariant === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200"
              : "border-red-200 bg-red-50 text-red-900 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-200"
          }`}
        >
          <p className="text-sm">
            {statusMessage}
            {statusLink && (
              <>
                {" "}
                <a
                  href={statusLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold underline"
                >
                  View PR
                </a>
              </>
            )}
          </p>
        </div>
      )}

      {activeTab === "content" && (
        <ContentTab
          draft={draft}
          setDraft={setDraft}
          saveAction={saveAction}
          publishAction={publishAction}
          isSaving={isSaving}
          isPublishing={isPublishing}
        />
      )}

      {activeTab === "preview" && (
        <PreviewTab draft={draft} contentType={contentType} />
      )}

      {activeTab === "social" && <SocialTab slug={draft.slug} />}
    </div>
  );
}

function TabList({
  activeTab,
  onChange,
}: {
  activeTab: ActiveTab;
  onChange: (tab: ActiveTab) => void;
}) {
  const tabs: Array<{ key: ActiveTab; label: string; description: string }> = [
    { key: "content", label: "Content", description: "Frontmatter + MDX editor" },
    { key: "preview", label: "Preview", description: "Live render" },
    { key: "social", label: "Social & Distribution", description: "AI-powered snippets" },
  ];

  return (
    <div className="flex flex-wrap gap-3">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          onClick={() => onChange(tab.key)}
          className={`rounded-2xl border px-4 py-2 text-left transition ${
            activeTab === tab.key
              ? "border-foreground bg-foreground/5"
              : "border-border bg-card hover:bg-card/80"
          }`}
        >
          <p className="font-medium">{tab.label}</p>
          <p className="text-xs text-muted-foreground">{tab.description}</p>
        </button>
      ))}
    </div>
  );
}

function ContentTab({
  draft,
  setDraft,
  saveAction,
  publishAction,
  isSaving,
  isPublishing,
}: {
  draft: DraftState;
  setDraft: (draft: DraftState) => void;
  saveAction: (formData: FormData) => void;
  publishAction: (formData: FormData) => void;
  isSaving: boolean;
  isPublishing: boolean;
}) {
  return (
    <div className="space-y-6">
      <form action={saveAction} className="space-y-6 rounded-2xl border bg-card p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-xs font-semibold text-muted-foreground">Slug (read-only)</label>
            <Input value={draft.slug} disabled className="bg-muted" />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground">Status</label>
            <select
              value={draft.status}
              onChange={(e) => setDraft({ ...draft, status: e.target.value as DraftState["status"] })}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            >
              <option value="draft">Draft</option>
              <option value="review">Review</option>
              <option value="scheduled">Scheduled</option>
              <option value="published">Published</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-muted-foreground">Title</label>
          <Input
            value={draft.title}
            onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            placeholder="Content title (max 70 chars)"
            maxLength={70}
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-muted-foreground">Summary</label>
          <Textarea
            value={draft.summary}
            onChange={(e) => setDraft({ ...draft, summary: e.target.value })}
            placeholder="50-160 characters"
            rows={3}
            maxLength={160}
          />
          <p className="mt-1 text-xs text-muted-foreground">{draft.summary.length} / 160 characters</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-xs font-semibold text-muted-foreground">Published At</label>
            <Input
              type="date"
              value={draft.publishedAt.split("T")[0]}
              onChange={(e) => setDraft({ ...draft, publishedAt: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground">Publish At (scheduled)</label>
            <Input
              type="datetime-local"
              value={draft.publishAt}
              onChange={(e) => setDraft({ ...draft, publishAt: e.target.value })}
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-xs font-semibold text-muted-foreground">Region</label>
            <Input
              value={draft.region}
              onChange={(e) => setDraft({ ...draft, region: e.target.value })}
              placeholder="e.g., Payas–İslahiye, Turkey"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground">Review Status</label>
            <select
              value={draft.review_status}
              onChange={(e) => setDraft({ ...draft, review_status: e.target.value as DraftState["review_status"] })}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            >
              <option value="needs-review">Needs Review</option>
              <option value="approved">Approved</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-muted-foreground">Commodities (comma-separated)</label>
          <Input
            value={draft.commodity}
            onChange={(e) => setDraft({ ...draft, commodity: e.target.value })}
            placeholder="Lithium, Cobalt, Rare Earths"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-muted-foreground">Tags (comma-separated)</label>
          <Input
            value={draft.tags}
            onChange={(e) => setDraft({ ...draft, tags: e.target.value })}
            placeholder="prospectivity, SAR, machine-learning"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-xs font-semibold text-muted-foreground">Image Path</label>
            <Input
              value={draft.image}
              onChange={(e) => setDraft({ ...draft, image: e.target.value })}
              placeholder="/images/insights/example.jpg"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground">Image Alt Text</label>
            <Input
              value={draft.imageAlt}
              onChange={(e) => setDraft({ ...draft, imageAlt: e.target.value })}
              placeholder="Descriptive alt text"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-muted-foreground">Image Prompt (for AI generation)</label>
          <Textarea
            value={draft.imagePrompt}
            onChange={(e) => setDraft({ ...draft, imagePrompt: e.target.value })}
            rows={2}
            placeholder="Prompt for Stability AI image generation"
          />
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={draft.ai_generated}
              onChange={(e) => setDraft({ ...draft, ai_generated: e.target.checked })}
            />
            <span>AI Generated Content</span>
          </label>
        </div>

        <div>
          <label className="text-xs font-semibold text-muted-foreground">MDX Body</label>
          <Textarea
            value={draft.body}
            onChange={(e) => setDraft({ ...draft, body: e.target.value })}
            rows={20}
            className="font-mono text-xs"
            placeholder="Write your MDX content here..."
          />
          <p className="mt-1 text-xs text-muted-foreground">
            {draft.body.split(/\s+/).filter(Boolean).length} words · ~
            {Math.max(1, Math.round(draft.body.split(/\s+/).filter(Boolean).length / 190))} min read
          </p>
        </div>

        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            Saves open a GitHub PR for this {draft.status === "published" ? "publish" : "update"}.
          </p>
          <div className="flex gap-2">
            <Button type="submit" disabled={isSaving || isPublishing} variant="outline">
              {isSaving ? "Saving..." : "Save Draft"}
            </Button>
            <Button
              type="button"
              onClick={() => {
                const formData = new FormData();
                publishAction(formData);
              }}
              disabled={isSaving || isPublishing}
            >
              {isPublishing ? "Publishing..." : "Publish"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

function PreviewTab({ draft, contentType }: { draft: DraftState; contentType: ContentType }) {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border bg-card p-6">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              draft.status === "published"
                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-200"
                : draft.status === "scheduled"
                  ? "bg-purple-100 text-purple-800 dark:bg-purple-500/15 dark:text-purple-200"
                  : draft.status === "review"
                    ? "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-200"
                    : "bg-slate-200 text-slate-900 dark:bg-slate-500/20 dark:text-slate-100"
            }`}
          >
            {draft.status}
          </span>
          {draft.publishAt && (
            <span className="text-xs text-muted-foreground">
              Scheduled for: {new Date(draft.publishAt).toLocaleString()}
            </span>
          )}
          <span className="text-xs text-muted-foreground">
            Path: /{contentType === "insight" ? "insights" : "case-studies"}/{draft.slug}
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">{draft.title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{draft.region} · {draft.commodity}</p>
        <p className="mt-4 text-base text-muted-foreground">{draft.summary}</p>
      </div>

      <div className="rounded-xl border bg-card p-6">
        <div className="prose prose-slate dark:prose-invert max-w-none">
          <div dangerouslySetInnerHTML={{ __html: draft.body.replace(/\n/g, "<br />") }} />
        </div>
      </div>

      <div className="rounded-xl border bg-muted/50 p-4 text-xs text-muted-foreground">
        <p>
          <strong>Note:</strong> This is a simplified preview. For full MDX rendering with components, merge the PR
          and view the live page.
        </p>
      </div>
    </div>
  );
}

function SocialTab({ slug }: { slug: string }) {
  const [linkedinPost, setLinkedinPost] = useState("");
  const [linkedinCarousel, setLinkedinCarousel] = useState("");
  const [xPost, setXPost] = useState("");
  const [emailTeaser, setEmailTeaser] = useState("");
  const [ogPrompt, setOgPrompt] = useState("");
  
  const [loadingLinkedin, setLoadingLinkedin] = useState(false);
  const [loadingCarousel, setLoadingCarousel] = useState(false);
  const [loadingX, setLoadingX] = useState(false);
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [loadingOg, setLoadingOg] = useState(false);
  
  const [copyStatus, setCopyStatus] = useState<Record<string, boolean>>({});

  const handleCopy = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopyStatus({ ...copyStatus, [key]: true });
    setTimeout(() => setCopyStatus({ ...copyStatus, [key]: false }), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border bg-card p-6">
        <h2 className="text-lg font-semibold">Social & Distribution</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Generate brand-aware marketing snippets for LinkedIn, X (Twitter), and email using AI.
        </p>
      </div>

      {/* LinkedIn Post */}
      <div className="rounded-xl border bg-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">LinkedIn Post</h3>
            <p className="text-xs text-muted-foreground">Professional B2B post (300-500 words)</p>
          </div>
          <Button
            size="sm"
            onClick={async () => {
              setLoadingLinkedin(true);
              try {
                const { generateLinkedInPost } = await import("@/app/admin/editor/actions");
                const result = await generateLinkedInPost(slug);
                if (result.success && result.content) {
                  setLinkedinPost(result.content);
                } else {
                  alert(`Error: ${result.error || "Unknown error"}`);
                }
              } catch (error) {
                alert(`Failed to generate: ${error instanceof Error ? error.message : "Unknown"}`);
              } finally {
                setLoadingLinkedin(false);
              }
            }}
            disabled={loadingLinkedin}
          >
            {loadingLinkedin ? "Generating..." : "Generate"}
          </Button>
        </div>
        {linkedinPost && (
          <>
            <Textarea
              value={linkedinPost}
              onChange={(e) => setLinkedinPost(e.target.value)}
              rows={10}
              className="font-mono text-sm"
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{linkedinPost.split(/\s+/).filter(Boolean).length} words</span>
              <Button size="sm" variant="outline" onClick={() => handleCopy(linkedinPost, "linkedin")}>
                {copyStatus.linkedin ? "Copied!" : "Copy"}
              </Button>
            </div>
          </>
        )}
      </div>

      {/* LinkedIn Carousel */}
      <div className="rounded-xl border bg-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">LinkedIn Carousel Outline</h3>
            <p className="text-xs text-muted-foreground">8-10 slide outline for visual post</p>
          </div>
          <Button
            size="sm"
            onClick={async () => {
              setLoadingCarousel(true);
              try {
                const { generateLinkedInCarousel } = await import("@/app/admin/editor/actions");
                const result = await generateLinkedInCarousel(slug);
                if (result.success && result.content) {
                  setLinkedinCarousel(result.content);
                } else {
                  alert(`Error: ${result.error || "Unknown error"}`);
                }
              } catch (error) {
                alert(`Failed to generate: ${error instanceof Error ? error.message : "Unknown"}`);
              } finally {
                setLoadingCarousel(false);
              }
            }}
            disabled={loadingCarousel}
          >
            {loadingCarousel ? "Generating..." : "Generate"}
          </Button>
        </div>
        {linkedinCarousel && (
          <>
            <Textarea
              value={linkedinCarousel}
              onChange={(e) => setLinkedinCarousel(e.target.value)}
              rows={12}
              className="font-mono text-sm"
            />
            <div className="flex justify-end">
              <Button size="sm" variant="outline" onClick={() => handleCopy(linkedinCarousel, "carousel")}>
                {copyStatus.carousel ? "Copied!" : "Copy"}
              </Button>
            </div>
          </>
        )}
      </div>

      {/* X (Twitter) Post */}
      <div className="rounded-xl border bg-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">X (Twitter) Post</h3>
            <p className="text-xs text-muted-foreground">Punchy technical post (~240 chars)</p>
          </div>
          <Button
            size="sm"
            onClick={async () => {
              setLoadingX(true);
              try {
                const { generateXPost } = await import("@/app/admin/editor/actions");
                const result = await generateXPost(slug);
                if (result.success && result.content) {
                  setXPost(result.content);
                } else {
                  alert(`Error: ${result.error || "Unknown error"}`);
                }
              } catch (error) {
                alert(`Failed to generate: ${error instanceof Error ? error.message : "Unknown"}`);
              } finally {
                setLoadingX(false);
              }
            }}
            disabled={loadingX}
          >
            {loadingX ? "Generating..." : "Generate"}
          </Button>
        </div>
        {xPost && (
          <>
            <Textarea
              value={xPost}
              onChange={(e) => setXPost(e.target.value)}
              rows={4}
              className="font-mono text-sm"
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className={xPost.length > 280 ? "text-red-600 font-semibold" : ""}>
                {xPost.length} / 280 characters {xPost.length > 280 ? "(too long!)" : ""}
              </span>
              <Button size="sm" variant="outline" onClick={() => handleCopy(xPost, "x")}>
                {copyStatus.x ? "Copied!" : "Copy"}
              </Button>
            </div>
          </>
        )}
      </div>

      {/* Email Teaser */}
      <div className="rounded-xl border bg-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Email Newsletter Teaser</h3>
            <p className="text-xs text-muted-foreground">Subject + body (100-150 words)</p>
          </div>
          <Button
            size="sm"
            onClick={async () => {
              setLoadingEmail(true);
              try {
                const { generateEmailTeaser } = await import("@/app/admin/editor/actions");
                const result = await generateEmailTeaser(slug);
                if (result.success && result.content) {
                  setEmailTeaser(result.content);
                } else {
                  alert(`Error: ${result.error || "Unknown error"}`);
                }
              } catch (error) {
                alert(`Failed to generate: ${error instanceof Error ? error.message : "Unknown"}`);
              } finally {
                setLoadingEmail(false);
              }
            }}
            disabled={loadingEmail}
          >
            {loadingEmail ? "Generating..." : "Generate"}
          </Button>
        </div>
        {emailTeaser && (
          <>
            <Textarea
              value={emailTeaser}
              onChange={(e) => setEmailTeaser(e.target.value)}
              rows={6}
              className="font-mono text-sm"
            />
            <div className="flex justify-end">
              <Button size="sm" variant="outline" onClick={() => handleCopy(emailTeaser, "email")}>
                {copyStatus.email ? "Copied!" : "Copy"}
              </Button>
            </div>
          </>
        )}
      </div>

      {/* OG Image Prompt */}
      <div className="rounded-xl border bg-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">OG Image Prompt</h3>
            <p className="text-xs text-muted-foreground">Stability AI prompt for share image</p>
          </div>
          <Button
            size="sm"
            onClick={async () => {
              setLoadingOg(true);
              try {
                const { generateOgImagePrompt } = await import("@/app/admin/editor/actions");
                const result = await generateOgImagePrompt(slug);
                if (result.success && result.content) {
                  setOgPrompt(result.content);
                } else {
                  alert(`Error: ${result.error || "Unknown error"}`);
                }
              } catch (error) {
                alert(`Failed to generate: ${error instanceof Error ? error.message : "Unknown"}`);
              } finally {
                setLoadingOg(false);
              }
            }}
            disabled={loadingOg}
          >
            {loadingOg ? "Generating..." : "Generate"}
          </Button>
        </div>
        {ogPrompt && (
          <>
            <Textarea
              value={ogPrompt}
              onChange={(e) => setOgPrompt(e.target.value)}
              rows={4}
              className="font-mono text-sm"
            />
            <div className="flex justify-end">
              <Button size="sm" variant="outline" onClick={() => handleCopy(ogPrompt, "og")}>
                {copyStatus.og ? "Copied!" : "Copy"}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
