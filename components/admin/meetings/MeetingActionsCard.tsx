"use client";

import { useState } from "react";
import {
  CheckCircle2,
  Circle,
  Clock,
  Plus,
  Trash2,
  User,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  addActionItemAction,
  cycleActionStatusAction,
  deleteActionItemAction,
} from "@/app/admin/meetings/[id]/actions";
import {
  KNOWN_PARTICIPANTS,
  type MeetingActionRecord,
  type ActionStatus,
} from "@/lib/meeting-store";

type MeetingActionsCardProps = {
  meetingId: string;
  actions: MeetingActionRecord[];
};

function getStatusStyles(status: ActionStatus) {
  switch (status) {
    case "open":
      return {
        bg: "bg-slate-700/60",
        text: "text-slate-200",
        icon: <Circle className="h-3.5 w-3.5" />,
        label: "Open",
      };
    case "in_progress":
      return {
        bg: "bg-amber-950/60",
        text: "text-amber-300",
        icon: <Clock className="h-3.5 w-3.5" />,
        label: "In progress",
      };
    case "done":
      return {
        bg: "bg-emerald-950/60",
        text: "text-emerald-300",
        icon: <CheckCircle2 className="h-3.5 w-3.5" />,
        label: "Done",
      };
  }
}

function formatDueDate(date: string | null) {
  if (!date) return null;
  try {
    return new Intl.DateTimeFormat("en", {
      day: "numeric",
      month: "short",
    }).format(new Date(date));
  } catch {
    return date;
  }
}

function isOverdue(dueDate: string | null, status: ActionStatus): boolean {
  if (!dueDate || status === "done") return false;
  return new Date(dueDate) < new Date();
}

export function MeetingActionsCard({
  meetingId,
  actions,
}: MeetingActionsCardProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDescription, setNewDescription] = useState("");
  const [newOwner, setNewOwner] = useState<string>(KNOWN_PARTICIPANTS[0]);
  const [newDueDate, setNewDueDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [cyclingId, setCyclingId] = useState<string | null>(null);

  const openCount = actions.filter((a) => a.status !== "done").length;

  const handleAddAction = async () => {
    if (!newDescription.trim()) return;
    setSaving(true);
    try {
      await addActionItemAction(
        meetingId,
        newDescription.trim(),
        newOwner,
        newDueDate || null
      );
      setNewDescription("");
      setNewDueDate("");
      setShowAddForm(false);
    } finally {
      setSaving(false);
    }
  };

  const handleCycleStatus = async (action: MeetingActionRecord) => {
    setCyclingId(action.id);
    try {
      await cycleActionStatusAction(action.id, action.status, meetingId);
    } finally {
      setCyclingId(null);
    }
  };

  const handleDelete = async (actionId: string) => {
    if (!confirm("Delete this action item?")) return;
    await deleteActionItemAction(actionId, meetingId);
  };

  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-sm font-semibold flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          Action items
          {openCount > 0 && (
            <span className="ml-1 rounded-full bg-amber-950/60 px-2 py-0.5 text-xs font-medium text-amber-300">
              {openCount} open
            </span>
          )}
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          <Plus className="h-3.5 w-3.5 mr-1" />
          Add action
        </Button>
      </div>
      <p className="text-xs text-muted-foreground mb-4">
        Tasks created from this meeting so nothing gets lost.
      </p>

      {/* Add action form */}
      {showAddForm && (
        <div className="mb-4 rounded-lg border border-dashed bg-muted/20 p-4 space-y-3">
          <Input
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            placeholder="Describe the action clearly…"
            autoFocus
          />
          <div className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-[120px]">
              <label className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                <User className="h-3 w-3" />
                Owner
              </label>
              <select
                value={newOwner}
                onChange={(e) => setNewOwner(e.target.value)}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="" disabled>
                  Select owner…
                </option>
                {KNOWN_PARTICIPANTS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="flex-1 min-w-[120px]">
              <label className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                <Calendar className="h-3 w-3" />
                Due date{" "}
                <span className="text-muted-foreground/60">(optional)</span>
              </label>
              <Input
                type="date"
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowAddForm(false);
                setNewDescription("");
                setNewDueDate("");
              }}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleAddAction}
              disabled={saving || !newDescription.trim()}
            >
              {saving ? "Adding..." : "Add action"}
            </Button>
          </div>
        </div>
      )}

      {/* Actions list */}
      {actions.length === 0 ? (
        <div className="text-center py-8 px-4 rounded-lg border border-dashed bg-muted/20">
          <CheckCircle2 className="mx-auto h-8 w-8 text-muted-foreground/40" />
          <p className="mt-3 text-sm font-medium">No action items yet</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Use action items to turn meeting discussion into specific, assigned
            tasks.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => setShowAddForm(true)}
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            Add the first action
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {actions.map((action) => {
            const statusStyles = getStatusStyles(action.status);
            const overdue = isOverdue(action.dueDate, action.status);

            return (
              <div
                key={action.id}
                className={`group flex items-start gap-3 rounded-lg border p-3 transition ${
                  action.status === "done"
                    ? "bg-muted/20 opacity-60"
                    : "bg-slate-950/40"
                }`}
              >
                {/* Status button */}
                <button
                  onClick={() => handleCycleStatus(action)}
                  disabled={cyclingId === action.id}
                  className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition hover:scale-110 ${statusStyles.bg} ${statusStyles.text}`}
                  title="Click to update status"
                >
                  {cyclingId === action.id ? (
                    <span className="animate-spin">⋯</span>
                  ) : (
                    statusStyles.icon
                  )}
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm ${
                      action.status === "done"
                        ? "line-through text-muted-foreground"
                        : "text-foreground"
                    }`}
                  >
                    {action.description}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {action.owner}
                    </span>
                    {action.dueDate && (
                      <span
                        className={`inline-flex items-center gap-1 ${
                          overdue ? "text-red-400" : ""
                        }`}
                      >
                        <Calendar className="h-3 w-3" />
                        {formatDueDate(action.dueDate)}
                        {overdue && " (overdue)"}
                      </span>
                    )}
                  </div>
                </div>

                {/* Delete button */}
                <button
                  onClick={() => handleDelete(action.id)}
                  className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-400 transition"
                  title="Delete action"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
