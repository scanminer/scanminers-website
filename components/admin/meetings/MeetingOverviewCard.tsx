"use client";

import { useState } from "react";
import { Calendar, Users, Pencil, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateMeetingDetailsAction } from "@/app/admin/meetings/[id]/actions";
import { KNOWN_PARTICIPANTS, type MeetingType } from "@/lib/meeting-store";

type MeetingOverviewCardProps = {
  meetingId: string;
  title: string;
  dateTime: string;
  type: MeetingType;
  participants: string[];
};

function formatDateTime(value: string) {
  try {
    return new Intl.DateTimeFormat("en", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZoneName: "short",
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

export function MeetingOverviewCard({
  meetingId,
  title,
  dateTime,
  type,
  participants,
}: MeetingOverviewCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(title);
  const [editDateTime, setEditDateTime] = useState(
    dateTime.slice(0, 16) // Format for datetime-local input
  );
  const [editType, setEditType] = useState<MeetingType>(type);
  const [editParticipants, setEditParticipants] =
    useState<string[]>(participants);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateMeetingDetailsAction(meetingId, {
        title: editTitle,
        dateTime: new Date(editDateTime).toISOString(),
        type: editType,
        participants: editParticipants,
      });
      setIsEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditTitle(title);
    setEditDateTime(dateTime.slice(0, 16));
    setEditType(type);
    setEditParticipants(participants);
    setIsEditing(false);
  };

  const toggleParticipant = (p: string) => {
    setEditParticipants((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );
  };

  if (isEditing) {
    return (
      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            Overview
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
              Title
            </label>
            <Input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wide">
              Date & time
            </label>
            <Input
              type="datetime-local"
              value={editDateTime}
              onChange={(e) => setEditDateTime(e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wide">
              Type
            </label>
            <div className="flex gap-2 mt-1">
              {(["internal", "prospect", "client"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setEditType(t)}
                  className={`rounded-full px-3 py-1 text-xs font-medium capitalize transition ${
                    editType === t
                      ? getTypeStyles(t)
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wide">
              Participants
            </label>
            <div className="flex flex-wrap gap-2 mt-1">
              {KNOWN_PARTICIPANTS.map((p) => (
                <button
                  key={p}
                  onClick={() => toggleParticipant(p)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                    editParticipants.includes(p)
                      ? "bg-teal-950/60 text-teal-300 border border-teal-700"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          Overview
        </h2>
        <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
          <Pencil className="h-3.5 w-3.5 mr-1" />
          Edit details
        </Button>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide">
            Title
          </p>
          <p className="mt-1 text-sm font-medium">{title}</p>
        </div>

        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide">
            Date & time
          </p>
          <p className="mt-1 text-sm">{formatDateTime(dateTime)}</p>
        </div>

        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide">
            Type
          </p>
          <span
            className={`mt-1 inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${getTypeStyles(
              type
            )}`}
          >
            {type}
          </span>
        </div>

        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            Participants
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {participants.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">
                No participants added
              </p>
            ) : (
              participants.map((p, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 rounded-full bg-slate-800 px-2.5 py-1 text-xs font-medium"
                >
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-700 text-[10px] font-bold">
                    {p.charAt(0).toUpperCase()}
                  </span>
                  {p}
                </span>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
