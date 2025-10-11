// Placeholder module to avoid Next typegen references; no handlers exported.
// This file intentionally defines no HTTP method exports, so no route is created.
export const runtime = 'edge';
export const dynamic = 'force-dynamic';
export {};
// Sentry example API temporarily disabled to bypass a next-on-pages bundling issue.
// If you re-enable, ensure edge runtime and unique function identifiers.
// import { NextResponse } from "next/server";
// export const runtime = 'edge';
// export const dynamic = "force-dynamic";
// class SentryExampleAPIError extends Error {
//   constructor(message: string | undefined) {
//     super(message);
//     this.name = "SentryExampleAPIError";
//   }
// }
// export function GET() {
//   throw new SentryExampleAPIError("This error is raised on the backend called by the example page.");
//   return NextResponse.json({ data: "Testing Sentry Error..." });
// }
