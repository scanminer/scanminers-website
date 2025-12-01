"use server";

import { redirect } from "next/navigation";
import { createMeeting, type MeetingCreateInput } from "@/lib/meeting-store";

export async function createMeetingAction(input: MeetingCreateInput) {
  const meeting = await createMeeting(input);
  redirect(`/admin/meetings/${meeting.id}`);
}
