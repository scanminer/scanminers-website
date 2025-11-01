"use client";

import type { ReactNode } from "react";

export function ConfirmDialog({
  open,
  title = "Confirm",
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title?: string;
  description?: ReactNode;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onCancel} />
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-[92vw] max-w-md rounded-lg border border-black/10 bg-white p-5 shadow-xl dark:border-white/10 dark:bg-neutral-900"
      >
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        {description && <div className="text-sm text-gray-700 dark:text-gray-300 mb-4">{description}</div>}
        <div className="flex justify-end gap-2">
          <button
            className="px-3 py-1 rounded border border-black/20 dark:border-white/20"
            onClick={onCancel}
          >
            {cancelText}
          </button>
          <button
            className="px-3 py-1 rounded bg-black text-white dark:bg-white dark:text-black"
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
