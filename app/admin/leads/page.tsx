import Link from "next/link";
import { notFound } from "next/navigation";
import { listLeads, type LeadStatus, type LeadType } from "@/lib/lead-store";
import { LeadStatusPill } from "@/components/admin/leads/LeadStatusPill";
import { LeadContactBadge } from "@/components/admin/leads/LeadContactBadge";

export const revalidate = 0;

const STATUS_OPTIONS: Array<{ value: LeadStatus | "all"; label: string }> = [
  { value: "all", label: "All" },
  { value: "new", label: "New" },
  { value: "viewed", label: "Viewed" },
  { value: "replied", label: "Replied" },
];

const TYPE_OPTIONS: Array<{ value: LeadType | "all"; label: string }> = [
  { value: "all", label: "All types" },
  { value: "contact", label: "Contact" },
  { value: "prospectivity_brief", label: "Prospectivity brief" },
  { value: "consultation", label: "Consultation" },
];

const TYPE_LABELS: Record<LeadType, string> = {
  contact: "Contact",
  prospectivity_brief: "Prospectivity brief",
  consultation: "Consultation",
};

function getParamValue(
  value: string | string[] | undefined
): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function parseStatusParam(value: string | undefined): LeadStatus | "all" {
  if (value === "new" || value === "viewed" || value === "replied")
    return value;
  return "all";
}

function parseTypeParam(value: string | undefined): LeadType | "all" {
  if (
    value === "contact" ||
    value === "prospectivity_brief" ||
    value === "consultation"
  )
    return value;
  return "all";
}

function buildQuery(status: LeadStatus | "all", type: LeadType | "all") {
  const params = new URLSearchParams();
  if (status !== "all") params.set("status", status);
  if (type !== "all") params.set("type", type);
  const query = params.toString();
  return query ? `?${query}` : "";
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

type SearchParams = { [key: string]: string | string[] | undefined };

type LeadsPageProps = {
  searchParams?: Promise<SearchParams>;
};

export default async function AdminLeadsPage(props: LeadsPageProps) {
  const searchParams = (await props.searchParams) ?? {};
  const statusFilter = parseStatusParam(getParamValue(searchParams.status));
  const typeFilter = parseTypeParam(getParamValue(searchParams.type));

  const { leads, summary } = await listLeads({
    status: statusFilter,
    type: typeFilter,
    limit: 120,
  });

  if (!summary) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Leads</h1>
        <p className="text-sm text-muted-foreground">
          Track every inbound brief, consultation, and contact submission.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <SummaryCard label="Total" value={summary.total} helper="All-time" />
        <SummaryCard
          label="Active"
          value={summary.new + summary.viewed}
          helper="New + Viewed"
        />
        <SummaryCard
          label="Replied"
          value={summary.replied}
          helper="Marked as replied"
        />
      </section>

      <section className="rounded-xl border bg-card p-4 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {STATUS_OPTIONS.map((option) => (
              <FilterChip
                key={option.value}
                href={`/admin/leads${buildQuery(option.value, typeFilter)}`}
                active={statusFilter === option.value}
                label={option.label}
              />
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {TYPE_OPTIONS.map((option) => (
              <FilterChip
                key={option.value}
                href={`/admin/leads${buildQuery(statusFilter, option.value)}`}
                active={typeFilter === option.value}
                label={option.label}
              />
            ))}
          </div>
        </div>

        <div className="mt-4 divide-y rounded-xl border bg-background">
          {leads.length === 0 ? (
            <p className="p-6 text-sm text-muted-foreground">
              No leads for this filter yet.
            </p>
          ) : (
            leads.map((lead) => (
              <Link
                key={lead.id}
                href={`/admin/leads/${lead.id}`}
                className="flex flex-col gap-3 p-4 transition hover:bg-muted/60 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm font-semibold leading-tight">
                    {lead.name}
                    {lead.company ? (
                      <span className="text-muted-foreground">
                        {" "}
                        · {lead.company}
                      </span>
                    ) : null}
                  </p>
                  <p className="text-xs text-muted-foreground">{lead.email}</p>
                  {lead.message ? (
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                      {lead.message}
                    </p>
                  ) : null}
                </div>
                <div className="flex flex-col items-start gap-3 text-sm sm:items-end">
                  <div className="flex flex-wrap items-center gap-2 justify-end">
                    <LeadStatusPill status={lead.status} />
                    <LeadContactBadge status={lead.contactStatus} />
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                      {TYPE_LABELS[lead.type]}
                    </span>
                    {lead.aiValueTier ? (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-900">
                        Value: {lead.aiValueTier}
                      </span>
                    ) : null}
                    {lead.aiUrgency ? (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900">
                        Urgency: {lead.aiUrgency}
                      </span>
                    ) : null}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Received {formatDateTime(lead.createdAt)}
                  </p>
                </div>
              </Link>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: number;
  helper: string;
}) {
  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
      <p className="text-xs text-muted-foreground">{helper}</p>
    </div>
  );
}

function FilterChip({
  href,
  active,
  label,
}: {
  href: string;
  active: boolean;
  label: string;
}) {
  return (
    <Link
      href={href}
      className={`rounded-full px-3 py-1 text-xs font-medium transition ${
        active
          ? "bg-foreground text-background"
          : "bg-muted text-muted-foreground hover:bg-muted/80"
      }`}
    >
      {label}
    </Link>
  );
}
