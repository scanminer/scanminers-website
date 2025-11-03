import React from "react";
import InitiateForm from "@/components/InitiateForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Initiate Brief | Admin | Scanminers",
};

export default function InitiatePage() {
  return (
    <div className="min-h-screen p-8 pb-20 sm:p-20">
      <main className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Initiate a New Brief</h1>
        <p className="mb-4 text-gray-600">Create a minimal brief to seed a draft. This will create a file under <code>content/briefs/</code> and commit it on a new branch.</p>
        <InitiateForm />
      </main>
    </div>
  );
}
