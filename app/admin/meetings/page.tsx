import Link from "next/link";
import { Plus, ChevronRight, Users, Calendar, AlertCircle } from "lucide-react";
import {
  listMeetings,
  type MeetingType,
  KNOWN_PARTICIPANTS,
} from "@/lib/meeting-store";
import { Button } from "@/components/ui/button";

export const revalidate = 0;

const TYPE_OPTIONS: Array<{ value: MeetingType | "all"; label: string }> = [
  { value: "all", label: "All" },
  { value: "internal", label: "Internal" },
  { value: "prospect", label: "Prospect" },
  { value: "client", label: "Client" },
];

const DATE_PRESETS = [
  { value: "upcoming", label: "Upcoming" },
  { value: "last30", label: "Last 30 days" },
  { value: "last90", label: "Last 90 days" },
  { value: "all", label: "All time" },
];

function getParamValue(
  value: string | string[] | undefined
): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function parseTypeParam(value: string | undefined): MeetingType | "all" {
  if (value === "internal" || value === "prospect" || value === "client") {
    return value;
  }
  return "all";
}

function buildQuery(
  type: MeetingType | "all",
  datePreset: string,
  participant: string,
  search: string
) {
  const params = new URLSearchParams();
  if (type !== "all") params.set("type", type);
  if (datePreset !== "all") params.set("date", datePreset);
  if (participant) params.set("participant", participant);
  if (search) params.set("search", search);
  const query = params.toString();
  return query ? `?${query}` : "";
}

function formatDateTime(value: string) {
  try {
    return new Intl.DateTimeFormat("en", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function getTypeStyles(type: MeetingType) {
  switch (type) {
    case "internal":
      return "bg-slate-700/60 text-slate-200 border-slate-600";
    case "prospect":
      return "bg-cyan-950/60 text-cyan-300 border-cyan-800";
    case "client":
      return "bg-emerald-950/60 text-emerald-300 border-emerald-800";
    default:
      return "bg-slate-800 text-slate-300";
  }
}

function isUpcoming(dateTime: string): boolean {
  return new Date(dateTime) > new Date();
}

type SearchParams = { [key: string]: string | string[] | undefined };

type MeetingsPageProps = {
  searchParams?: Promise<SearchParams>;
};

export default async function AdminMeetingsPage(props: MeetingsPageProps) {
  const searchParams = (await props.searchParams) ?? {};
  const typeFilter = parseTypeParam(getParamValue(searchParams.type));
  const datePreset = getParamValue(searchParams.date) ?? "all";
  const participantFilter = getParamValue(searchParams.participant) ?? "";
  const searchQuery = getParamValue(searchParams.search) ?? "";

  // Calculate date range based on preset
  let dateFrom: string | undefined;
  let dateTo: string | undefined;
  const now = new Date();

  if (datePreset === "upcoming") {
    dateFrom = now.toISOString();
  } else if (datePreset === "last30") {
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    dateFrom = thirtyDaysAgo.toISOString();
    dateTo = now.toISOString();
  } else if (datePreset === "last90") {
    const ninetyDaysAgo = new Date(now);
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    dateFrom = ninetyDaysAgo.toISOString();
    dateTo = now.toISOString();
  }

  const meetings = await listMeetings({
    type: typeFilter,
    participant: participantFilter || undefined,
    dateFrom,
    dateTo,
    search: searchQuery || undefined,
    limit: 100,
  });

  const totalMeetings = meetings.length;
  const upcomingCount = meetings.filter((m) => isUpcoming(m.dateTime)).length;
  const openActionsCount = meetings.reduce(
    (acc, m) => acc + (m.openActionsCount ?? 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Meetings</h1>
          <p className="text-sm text-muted-foreground">
            All internal, prospect, and client meetings connected to Scanminers.
          </p>
          <p className="text-xs text-muted-foreground/70">
            Use meetings to track conversations, decisions, and action items
            across leads and projects.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/meetings/new" className="gap-2">
            <Plus className="h-4 w-4" />
            New meeting
          </Link>
        </Button>
      </header>

      {/* Summary Cards */}
      <section className="grid gap-4 sm:grid-cols-3">
        <SummaryCard
          label="Total meetings"
          value={totalMeetings}
          helper="All time"
          icon={<Calendar className="h-4 w-4" />}
        />
        <SummaryCard
          label="Upcoming"
          value={upcomingCount}
          helper="Scheduled ahead"
          icon={<Calendar className="h-4 w-4 text-cyan-400" />}
        />
        <SummaryCard
          label="Open actions"
          value={openActionsCount}
          helper="Across all meetings"
          icon={<AlertCircle className="h-4 w-4 text-amber-400" />}
        />
      </section>

      {/* Filters */}
      <section className="rounded-xl border bg-card p-4 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Type filters */}
          <div className="flex flex-wrap gap-2">
            {TYPE_OPTIONS.map((option) => (
              <FilterChip
                key={option.value}
                href={`/admin/meetings${buildQuery(
                  option.value,
                  datePreset,
                  participantFilter,
                  searchQuery
                )}`}
                active={typeFilter === option.value}
                label={option.label}
              />
            ))}
          </div>

          {/* Date presets */}
          <div className="flex flex-wrap gap-2">
            {DATE_PRESETS.map((preset) => (
              <FilterChip
                key={preset.value}
                href={`/admin/meetings${buildQuery(
                  typeFilter,
                  preset.value,
                  participantFilter,
                  searchQuery
                )}`}
                active={datePreset === preset.value}
                label={preset.label}
              />
            ))}
          </div>

          {/* Participant filter */}
          <div className="flex flex-wrap gap-2">
            <FilterChip
              href={`/admin/meetings${buildQuery(
                typeFilter,
                datePreset,
                "",
                searchQuery
              )}`}
              active={!participantFilter}
              label="All participants"
            />
            {KNOWN_PARTICIPANTS.map((p) => (
              <FilterChip
                key={p}
                href={`/admin/meetings${buildQuery(
                  typeFilter,
                  datePreset,
                  p,
                  searchQuery
                )}`}
                active={participantFilter === p}
                label={p}
              />
            ))}
          </div>
        </div>

        {/* Search - could enhance with client-side form */}
        <form className="mt-4">
          <input type="hidden" name="type" value={typeFilter} />
          <input type="hidden" name="date" value={datePreset} />
          <input type="hidden" name="participant" value={participantFilter} />
          <input
            type="search"
            name="search"
            placeholder="Search by title, lead, or project…"
            defaultValue={searchQuery}
            className="w-full rounded-lg border bg-background px-4 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </form>
      </section>

      {/* Meetings List */}
      <section className="space-y-3">
        {meetings.length === 0 ? (
          <div className="rounded-2xl border border-dashed bg-card/50 p-12 text-center">
            <Calendar className="mx-auto h-10 w-10 text-muted-foreground/50" />
            <h3 className="mt-4 text-base font-semibold">No meetings found</h3>
            <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
              Create your first meeting to start tracking conversations,
              decisions, and action items in one place.
            </p>
            <Button asChild variant="outline" className="mt-4">
              <Link href="/admin/meetings/new">
                <Plus className="mr-2 h-4 w-4" />
                Log a meeting
              </Link>
            </Button>
          </div>
        ) : (
          meetings.map((meeting) => (
            <Link
              key={meeting.id}
              href={`/admin/meetings/${meeting.id}`}
              className="group block rounded-2xl border bg-slate-950/60 p-5 shadow-sm transition-all hover:scale-[1.005] hover:border-teal-700/50 hover:bg-slate-900/80"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                {/* Left: Title, type badge, meta */}
                <div className="flex-1 space-y-2">
                  {/* Title row */}
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-semibold text-foreground group-hover:text-teal-300 transition-colors">
                      {meeting.title}
                    </h3>
                    <span
                      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium capitalize ${getTypeStyles(
                        meeting.type
                      )}`}
                    >
                      {meeting.type}
                    </span>
                    {isUpcoming(meeting.dateTime) && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-cyan-950/50 px-2 py-0.5 text-xs font-medium text-cyan-300">
                        Upcoming
                      </span>
                    )}
                  </div>

                  {/* Meta row */}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDateTime(meeting.dateTime)}
                    </span>
                    {meeting.participants.length > 0 && (
                      <span className="inline-flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5" />
                        <span className="flex gap-1">
                          {meeting.participants.slice(0, 3).map((p, i) => (
                            <span
                              key={i}
                              className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-700 text-[10px] font-medium text-slate-200"
                              title={p}
                            >
                              {p.charAt(0).toUpperCase()}
                            </span>
                          ))}
                          {meeting.participants.length > 3 && (
                            <span className="text-xs">
                              +{meeting.participants.length - 3}
                            </span>
                          )}
                        </span>
                      </span>
                    )}
                  </div>

                  {/* Related items */}
                  <div className="flex flex-wrap gap-2">
                    {meeting.leadName && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-cyan-950/40 px-2 py-0.5 text-xs text-cyan-300">
                        Lead: {meeting.leadName}
                      </span>
                    )}
                    {meeting.projectName && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-emerald-950/40 px-2 py-0.5 text-xs text-emerald-300">
                        Project: {meeting.projectName}
                      </span>
                    )}
                  </div>
                </div>

                {/* Right: Actions badge + chevron */}
                <div className="flex items-center gap-3">
                  {(meeting.openActionsCount ?? 0) > 0 ? (
                    <span className="inline-flex items-center rounded-full border border-amber-700/50 bg-amber-950/40 px-2.5 py-1 text-xs font-medium text-amber-300">
                      {meeting.openActionsCount} open action
                      {meeting.openActionsCount !== 1 ? "s" : ""}
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full border border-slate-700/50 bg-slate-900/40 px-2.5 py-1 text-xs font-medium text-slate-400">
                      No open actions
                    </span>
                  )}
                  <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          ))
        )}
      </section>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  helper,
  icon,
}: {
  label: string;
  value: number;
  helper: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        {icon}
      </div>
      <p className="mt-2 text-3xl font-bold tracking-tight">{value}</p>
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
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition ${
        active
          ? "bg-primary text-primary-foreground"
          : "bg-muted/60 text-muted-foreground hover:bg-muted"
      }`}
    >
      {label}
    </Link>
  );
}
