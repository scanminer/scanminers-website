"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Calendar, Users, FileText, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createMeetingAction } from "./actions";
import { KNOWN_PARTICIPANTS, type MeetingType } from "@/lib/meeting-store";

type LeadOption = { id: string; name: string; company?: string | null };
type ProjectOption = { id: string; projectName: string; clientName: string };

function getTypeStyles(type: MeetingType, selected: boolean) {
  const base =
    "rounded-full px-4 py-2 text-sm font-medium capitalize transition";
  if (!selected)
    return `${base} bg-muted text-muted-foreground hover:bg-muted/80`;

  switch (type) {
    case "internal":
      return `${base} bg-slate-700/60 text-slate-200 border border-slate-600`;
    case "prospect":
      return `${base} bg-cyan-950/60 text-cyan-300 border border-cyan-800`;
    case "client":
      return `${base} bg-emerald-950/60 text-emerald-300 border border-emerald-800`;
  }
}

export default function NewMeetingPage() {
  const searchParams = useSearchParams();
  const prefilledLeadId = searchParams.get("leadId");
  const prefilledLeadName = searchParams.get("leadName");

  const [title, setTitle] = useState("");
  const [dateTime, setDateTime] = useState(() => {
    // Default to now, rounded to nearest 15 minutes
    const now = new Date();
    now.setMinutes(Math.ceil(now.getMinutes() / 15) * 15, 0, 0);
    return now.toISOString().slice(0, 16);
  });
  const [type, setType] = useState<MeetingType>(
    prefilledLeadId ? "prospect" : "internal"
  );
  const [participants, setParticipants] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [relatedLeadId, setRelatedLeadId] = useState<string | null>(
    prefilledLeadId
  );
  const [relatedLeadName, setRelatedLeadName] = useState<string | null>(
    prefilledLeadName
  );
  const [relatedProjectId, setRelatedProjectId] = useState<string | null>(null);
  const [relatedProjectName, setRelatedProjectName] = useState<string | null>(
    null
  );

  const [leads, setLeads] = useState<LeadOption[]>([]);
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [showLeadSelect, setShowLeadSelect] = useState(false);
  const [showProjectSelect, setShowProjectSelect] = useState(false);

  const [saving, setSaving] = useState(false);

  // Generate default title when lead is prefilled
  useEffect(() => {
    if (prefilledLeadName && !title) {
      const today = new Date().toLocaleDateString("en", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
      setTitle(`Meeting – ${prefilledLeadName} – ${today}`);
    }
  }, [prefilledLeadName, title]);

  // Fetch leads and projects for linking
  useEffect(() => {
    if (showLeadSelect && leads.length === 0) {
      fetch("/api/admin/leads/search?limit=50")
        .then((res) => res.json() as Promise<{ leads?: LeadOption[] }>)
        .then((data) => setLeads(data.leads || []))
        .catch(() => setLeads([]));
    }
  }, [showLeadSelect, leads.length]);

  useEffect(() => {
    if (showProjectSelect && projects.length === 0) {
      fetch("/api/admin/projects/search?limit=50")
        .then((res) => res.json() as Promise<{ projects?: ProjectOption[] }>)
        .then((data) => setProjects(data.projects || []))
        .catch(() => setProjects([]));
    }
  }, [showProjectSelect, projects.length]);

  const toggleParticipant = (p: string) => {
    setParticipants((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !dateTime) return;

    setSaving(true);
    try {
      await createMeetingAction({
        title: title.trim(),
        dateTime: new Date(dateTime).toISOString(),
        type,
        participants,
        notes: notes.trim() || undefined,
        relatedLeadId,
        relatedProjectId,
      });
    } catch (error) {
      console.error("Failed to create meeting:", error);
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 border-b border-border/50 pb-4">
        <Link
          href="/admin/meetings"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to meetings
        </Link>
        <h1 className="text-2xl font-semibold">Log a meeting</h1>
        <p className="text-sm text-muted-foreground">
          Create a meeting record to track what was discussed, what was decided,
          and who owns the follow-up.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        {/* Title */}
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <label className="text-sm font-medium flex items-center gap-2 mb-3">
            <FileText className="h-4 w-4 text-muted-foreground" />
            Title
          </label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Core Team Alignment – Roles & Next 30 Days"
            required
          />
        </div>

        {/* Date & Time + Type */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <label className="text-sm font-medium flex items-center gap-2 mb-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              Date & time
            </label>
            <Input
              type="datetime-local"
              value={dateTime}
              onChange={(e) => setDateTime(e.target.value)}
              required
            />
          </div>

          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <label className="text-sm font-medium mb-3 block">Type</label>
            <div className="flex flex-wrap gap-2">
              {(["internal", "prospect", "client"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={getTypeStyles(t, type === t)}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Participants */}
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <label className="text-sm font-medium flex items-center gap-2 mb-3">
            <Users className="h-4 w-4 text-muted-foreground" />
            Participants
          </label>
          <div className="flex flex-wrap gap-2">
            {KNOWN_PARTICIPANTS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => toggleParticipant(p)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  participants.includes(p)
                    ? "bg-teal-950/60 text-teal-300 border border-teal-700"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Related Lead & Project */}
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <label className="text-sm font-medium flex items-center gap-2 mb-3">
            <Link2 className="h-4 w-4 text-muted-foreground" />
            Linked entities
          </label>
          <p className="text-xs text-muted-foreground mb-4">
            Attach this meeting to a lead or project for better history
            tracking.
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Lead */}
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
                Related lead
              </p>
              {relatedLeadId && relatedLeadName ? (
                <div className="flex items-center justify-between gap-2 rounded-lg bg-cyan-950/30 border border-cyan-900/40 p-3">
                  <span className="text-sm text-cyan-300">
                    {relatedLeadName}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setRelatedLeadId(null);
                      setRelatedLeadName(null);
                    }}
                    className="text-muted-foreground hover:text-red-400"
                  >
                    ×
                  </button>
                </div>
              ) : showLeadSelect ? (
                <div className="space-y-2">
                  <select
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                    onChange={(e) => {
                      const lead = leads.find((l) => l.id === e.target.value);
                      if (lead) {
                        setRelatedLeadId(lead.id);
                        setRelatedLeadName(lead.name);
                      }
                      setShowLeadSelect(false);
                    }}
                    defaultValue=""
                  >
                    <option value="" disabled>
                      Select a lead...
                    </option>
                    {leads.map((lead) => (
                      <option key={lead.id} value={lead.id}>
                        {lead.name}
                        {lead.company ? ` · ${lead.company}` : ""}
                      </option>
                    ))}
                  </select>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowLeadSelect(false)}
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowLeadSelect(true)}
                  className="w-full justify-start"
                >
                  Link to lead
                </Button>
              )}
            </div>

            {/* Project */}
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
                Related project
              </p>
              {relatedProjectId && relatedProjectName ? (
                <div className="flex items-center justify-between gap-2 rounded-lg bg-emerald-950/30 border border-emerald-900/40 p-3">
                  <span className="text-sm text-emerald-300">
                    {relatedProjectName}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setRelatedProjectId(null);
                      setRelatedProjectName(null);
                    }}
                    className="text-muted-foreground hover:text-red-400"
                  >
                    ×
                  </button>
                </div>
              ) : showProjectSelect ? (
                <div className="space-y-2">
                  <select
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                    onChange={(e) => {
                      const project = projects.find(
                        (p) => p.id === e.target.value
                      );
                      if (project) {
                        setRelatedProjectId(project.id);
                        setRelatedProjectName(project.projectName);
                      }
                      setShowProjectSelect(false);
                    }}
                    defaultValue=""
                  >
                    <option value="" disabled>
                      Select a project...
                    </option>
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.projectName} · {project.clientName}
                      </option>
                    ))}
                  </select>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowProjectSelect(false)}
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowProjectSelect(true)}
                  className="w-full justify-start"
                >
                  Link to project
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <label className="text-sm font-medium flex items-center gap-2 mb-3">
            <FileText className="h-4 w-4 text-muted-foreground" />
            Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            placeholder="Context, agenda, or key points…"
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-y"
          />
        </div>

        {/* Submit */}
        <div className="flex gap-3">
          <Button type="submit" disabled={saving || !title.trim()}>
            {saving ? "Creating…" : "Create meeting"}
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/admin/meetings">Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
