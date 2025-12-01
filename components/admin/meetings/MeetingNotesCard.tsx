"use client";

import { useState } from "react";
import { FileText, Pencil, Check, X, ListChecks } from "lucide-react";
import { Button } from "@/components/ui/button";
import { updateMeetingDetailsAction } from "@/app/admin/meetings/[id]/actions";

type MeetingNotesCardProps = {
  meetingId: string;
  notes: string | null;
  decisions: string | null;
};

export function MeetingNotesCard({
  meetingId,
  notes,
  decisions,
}: MeetingNotesCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editNotes, setEditNotes] = useState(notes ?? "");
  const [editDecisions, setEditDecisions] = useState(decisions ?? "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateMeetingDetailsAction(meetingId, {
        notes: editNotes || undefined,
        decisions: editDecisions || undefined,
      });
      setIsEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditNotes(notes ?? "");
    setEditDecisions(decisions ?? "");
    setIsEditing(false);
  };

  // Parse decisions as bullet points
  const decisionLines =
    decisions
      ?.split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0) ?? [];

  if (isEditing) {
    return (
      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            Notes & Decisions
          </h2>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              disabled={saving}
            >
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave} disabled={saving}>
              <Check className="h-4 w-4 mr-1" />
              {saving ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wide">
              Notes
            </label>
            <textarea
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
              rows={8}
              placeholder="Capture context and key discussion points…"
              className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-y"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Supports headings and bullet points for clarity.
            </p>
          </div>

          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wide">
              Decisions
            </label>
            <textarea
              value={editDecisions}
              onChange={(e) => setEditDecisions(e.target.value)}
              rows={4}
              placeholder="List any agreements or direction changes here…"
              className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-y"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              One decision per line — displayed as bullet points.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          Notes & Decisions
        </h2>
        <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
          <Pencil className="h-3.5 w-3.5 mr-1" />
          Edit notes
        </Button>
      </div>

      <div className="space-y-6">
        {/* Notes section */}
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
            Notes
          </p>
          {notes ? (
            <div className="rounded-lg bg-muted/40 p-4">
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {notes}
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              No notes recorded yet. Use this space to capture context and key
              discussion points.
            </p>
          )}
        </div>

        {/* Decisions section */}
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1">
            <ListChecks className="h-3.5 w-3.5" />
            Decisions
          </p>
          {decisionLines.length > 0 ? (
            <ul className="space-y-2">
              {decisionLines.map((decision, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 rounded-lg bg-emerald-950/30 border border-emerald-900/40 p-3"
                >
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-900/50 text-[10px] font-bold text-emerald-300">
                    ✓
                  </span>
                  <span className="text-sm text-foreground">{decision}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              No decisions recorded yet. List any agreements or direction
              changes here.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
