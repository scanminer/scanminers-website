import Link from "next/link";
import { notFound } from "next/navigation";
import { getLeadWithEvents, markLeadViewed } from "@/lib/lead-store";
import { LeadStatusPill } from "@/components/admin/leads/LeadStatusPill";
import { LeadContactBadge } from "@/components/admin/leads/LeadContactBadge";
import { LeadTimeline } from "@/components/admin/leads/LeadTimeline";
import { LeadAiPanel } from "@/components/admin/leads/LeadAiPanel";
import { LeadAiInsightPanel } from "@/components/admin/leads/LeadAiInsightPanel";
import { LeadActions } from "@/components/admin/leads/LeadActions";
import { getAdminActorName } from "@/lib/admin-actor";
import { reportServerError } from "@/lib/server-logger";

export const revalidate = 0;

const TYPE_LABEL_MAP = {
  contact: "Contact",
  prospectivity_brief: "Prospectivity brief",
  consultation: "Consultation",
} as const;

export default async function LeadDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  let payload = await getLeadWithEvents(params.id);
  if (!payload) {
    notFound();
  }

  if (payload.lead.status === "new") {
    try {
      const actor = await getAdminActorName();
      await markLeadViewed(params.id, actor);
      const refreshed = await getLeadWithEvents(params.id);
      if (refreshed) {
        payload = refreshed;
      }
    } catch (error) {
      await reportServerError(error, {
        action: "markLeadViewed",
        leadId: params.id,
      });
    }
  }

  const { lead, events } = payload;
  const metadataEntries = Object.entries(lead.metadata ?? {}).filter(
    ([, value]) => value !== undefined
  );
  const commodityList = Array.isArray(lead.metadata?.commodities)
    ? lead.metadata?.commodities
    : undefined;
  const dataSourcesList = Array.isArray(lead.metadata?.dataSources)
    ? lead.metadata?.dataSources
    : undefined;
  const resolvedContext = lead.additionalContext || lead.context || null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 border-b pb-4">
        <Link
          href="/admin/leads"
          className="text-xs font-medium text-muted-foreground transition hover:text-foreground"
        >
          ← Back to leads
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <LeadStatusPill status={lead.status} />
          <LeadContactBadge status={lead.contactStatus} />
          <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
            {TYPE_LABEL_MAP[lead.type]}
          </span>
          <span className="text-xs text-muted-foreground">
            Created {formatDateTime(lead.createdAt)}
          </span>
        </div>
        <LeadActions
          leadId={lead.id}
          status={lead.status}
          type={lead.type}
          source={lead.source}
          email={lead.email}
          draft={lead.lastReplyDraft}
        />
        <div>
          <h1 className="text-2xl font-semibold leading-snug">{lead.name}</h1>
          <p className="text-sm text-muted-foreground">{lead.email}</p>
        </div>
      </div>

      <section className="grid gap-4 lg:grid-cols-2">
        <InfoCard title="Lead details">
          <InfoRow label="Company" value={lead.company || "—"} />
          <InfoRow label="Role" value={lead.role || "—"} />
          <InfoRow label="Regions" value={lead.region || lead.regions || "—"} />
          <InfoRow
            label="Stage"
            value={lead.stage || formatValue(lead.metadata?.stage) || "—"}
          />
          <InfoRow label="Timing" value={lead.timing || "—"} />
          <InfoRow
            label="Commodities"
            value={
              formatList(lead.commodities) ||
              formatList(commodityList) ||
              lead.metadata?.sourceCommodity ||
              "—"
            }
          />
          <InfoRow
            label="Data sources"
            value={formatList(dataSourcesList) || "—"}
          />
          {lead.lastContactedAt ? (
            <>
              <InfoRow
                label="Last contacted"
                value={formatDateTime(lead.lastContactedAt)}
              />
              {lead.lastContactedBy ? (
                <InfoRow label="Contacted by" value={lead.lastContactedBy} />
              ) : null}
            </>
          ) : null}
        </InfoCard>
        <InfoCard title="Message & context">
          {lead.goal ? <InfoBlock label="Goal" text={lead.goal} /> : null}
          {lead.message && lead.message !== lead.goal ? (
            <InfoBlock label="Message" text={lead.message} />
          ) : null}
          {resolvedContext ? (
            <InfoBlock label="Context" text={resolvedContext} />
          ) : null}
          {!lead.goal && !lead.message && !resolvedContext ? (
            <p className="text-sm text-muted-foreground">
              No long-form notes provided.
            </p>
          ) : null}
        </InfoCard>
      </section>

      <section className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <InfoCard title="Timeline">
          <LeadTimeline events={events} />
        </InfoCard>
        <div className="space-y-4">
          <LeadAiPanel
            leadId={lead.id}
            leadType={lead.type}
            status={lead.status}
            source={lead.source}
            initialDraft={lead.lastReplyDraft}
          />
          <LeadAiInsightPanel
            leadId={lead.id}
            aiSummary={lead.aiSummary}
            aiTags={lead.aiTags}
            aiValueTier={lead.aiValueTier}
            aiUrgency={lead.aiUrgency}
            aiFitScore={lead.aiFitScore}
            aiConfidence={lead.aiConfidence}
          />
        </div>
      </section>

      <section className="rounded-xl border bg-card p-4 shadow-sm">
        <h2 className="text-sm font-semibold">Metadata</h2>
        {metadataEntries.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">
            No metadata captured.
          </p>
        ) : (
          <dl className="mt-4 grid gap-3 sm:grid-cols-2">
            {metadataEntries.map(([key, value]) => (
              <div key={key} className="rounded-lg bg-muted/40 p-3">
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                  {key}
                </dt>
                <dd className="text-sm font-medium text-foreground">
                  {formatValue(value)}
                </dd>
              </div>
            ))}
          </dl>
        )}
      </section>
    </div>
  );
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (Array.isArray(value)) return value.join(", ") || "—";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function formatDateTime(value: string) {
  try {
    return new Intl.DateTimeFormat("en", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function formatList(values?: string[] | null) {
  if (!values || values.length === 0) return "";
  return values.join(", ");
}

function InfoCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <h2 className="text-sm font-semibold">{title}</h2>
      <div className="mt-3 space-y-3">{children}</div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-2 sm:grid-cols-[160px_1fr]">
      <span className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <span className="text-sm font-medium text-foreground">
        {value || "—"}
      </span>
    </div>
  );
}

function InfoBlock({ label, text }: { label: string; text: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 whitespace-pre-wrap rounded-lg bg-muted/40 p-3 text-sm leading-relaxed text-foreground">
        {text}
      </p>
    </div>
  );
}
