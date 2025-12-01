"use server";

import { revalidatePath } from "next/cache";
import {
  updateMeeting,
  createMeetingAction as createAction,
  updateMeetingActionStatus,
  updateMeetingAction as updateAction,
  deleteMeetingAction as deleteAction,
  linkMeetingToLead,
  linkMeetingToProject,
  unlinkMeetingLead,
  unlinkMeetingProject,
  type MeetingUpdateInput,
  type ActionStatus,
} from "@/lib/meeting-store";

export async function updateMeetingDetailsAction(
  meetingId: string,
  input: MeetingUpdateInput
) {
  const result = await updateMeeting(meetingId, input);
  if (result) {
    revalidatePath(`/admin/meetings/${meetingId}`);
    revalidatePath("/admin/meetings");
  }
  return result;
}

export async function addActionItemAction(
  meetingId: string,
  description: string,
  owner: string,
  dueDate: string | null
) {
  const result = await createAction({
    meetingId,
    description,
    owner,
    dueDate,
  });
  revalidatePath(`/admin/meetings/${meetingId}`);
  return result;
}

export async function cycleActionStatusAction(
  actionId: string,
  currentStatus: ActionStatus,
  meetingId: string
) {
  const nextStatus: ActionStatus =
    currentStatus === "open"
      ? "in_progress"
      : currentStatus === "in_progress"
      ? "done"
      : "open";

  const result = await updateMeetingActionStatus(actionId, nextStatus);
  if (result) {
    revalidatePath(`/admin/meetings/${meetingId}`);
    revalidatePath("/admin/meetings");
  }
  return result;
}

export async function updateActionItemAction(
  actionId: string,
  meetingId: string,
  updates: { description?: string; owner?: string; dueDate?: string | null }
) {
  const result = await updateAction(actionId, updates);
  if (result) {
    revalidatePath(`/admin/meetings/${meetingId}`);
  }
  return result;
}

export async function deleteActionItemAction(
  actionId: string,
  meetingId: string
) {
  const result = await deleteAction(actionId);
  if (result) {
    revalidatePath(`/admin/meetings/${meetingId}`);
    revalidatePath("/admin/meetings");
  }
  return result;
}

export async function linkToLeadAction(meetingId: string, leadId: string) {
  const result = await linkMeetingToLead(meetingId, leadId);
  if (result) {
    revalidatePath(`/admin/meetings/${meetingId}`);
    revalidatePath("/admin/meetings");
  }
  return result;
}

export async function linkToProjectAction(
  meetingId: string,
  projectId: string
) {
  const result = await linkMeetingToProject(meetingId, projectId);
  if (result) {
    revalidatePath(`/admin/meetings/${meetingId}`);
    revalidatePath("/admin/meetings");
  }
  return result;
}

export async function unlinkLeadAction(meetingId: string) {
  const result = await unlinkMeetingLead(meetingId);
  if (result) {
    revalidatePath(`/admin/meetings/${meetingId}`);
    revalidatePath("/admin/meetings");
  }
  return result;
}

export async function unlinkProjectAction(meetingId: string) {
  const result = await unlinkMeetingProject(meetingId);
  if (result) {
    revalidatePath(`/admin/meetings/${meetingId}`);
    revalidatePath("/admin/meetings");
  }
  return result;
}
