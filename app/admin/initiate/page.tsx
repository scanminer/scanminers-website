export const dynamic = "force-dynamic";

import { Suspense } from "react";
import InitiateForm from "@/components/InitiateForm";

export default function InitiateBriefPage() {
  const apiEnabled = process.env.ENABLE_INITIATE_API === "true";
  const repo = process.env.NEXT_PUBLIC_GITHUB_REPO || process.env.GH_REPO || "";

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="mb-2 text-2xl font-semibold">Initiate a New Brief</h1>
      <p className="mb-6 text-sm text-gray-600">
        Create a draft brief to kick off editing. In production, this endpoint is disabled. Use local dev
        with ENABLE_INITIATE_API=true. {repo ? null : <>(Set NEXT_PUBLIC_GITHUB_REPO for better links.)</>}
      </p>

      {!apiEnabled && (
        <div className="mb-6 rounded-md border border-amber-300 bg-amber-50 p-3 text-amber-900">
          API disabled in this environment. Set <code className="font-mono">ENABLE_INITIATE_API=true</code> in
          local dev to enable submission.
        </div>
      )}

      <Suspense>
        <InitiateForm disabled={!apiEnabled} />
      </Suspense>
    </div>
  );
}
