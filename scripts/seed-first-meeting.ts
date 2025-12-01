/**
 * Seed script to create the first internal meeting record.
 * Run with: npx tsx scripts/seed-first-meeting.ts
 */

import { createMeeting } from "../lib/meeting-store";

const NOTES = `**Context**
First core team alignment meeting since Scanminers v0.1 went live on production (scanminers.com).
Goal: walk through the live system, align on the next 30 days, and clarify roles.

Notes and decisions to be filled in immediately after the meeting.`;

async function seedFirstMeeting() {
  // Cyprus is UTC+2 in winter, UTC+3 in summer
  // December 1st 2025 is winter time, so UTC+2
  // 12:30 Cyprus = 10:30 UTC
  const dateTime = new Date("2025-12-01T10:30:00.000Z").toISOString();

  const meeting = await createMeeting({
    title: "Core Team Alignment – Roles & Next 30 Days",
    type: "internal",
    dateTime,
    participants: ["Mahmood", "Dr. Amin", "Mehrtash"],
    notes: NOTES,
    relatedLeadId: null,
    relatedProjectId: null,
  });

  console.log("✅ Created first meeting:");
  console.log(`   ID: ${meeting.id}`);
  console.log(`   Title: ${meeting.title}`);
  console.log(`   Type: ${meeting.type}`);
  console.log(`   Date: ${meeting.dateTime}`);
  console.log(`   Participants: ${meeting.participants.join(", ")}`);
  console.log("");
  console.log(`🔗 View at: /admin/meetings/${meeting.id}`);

  return meeting;
}

seedFirstMeeting()
  .then(() => {
    console.log("\n🎉 Seed complete!");
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  });
