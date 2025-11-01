"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { twMerge } from "tailwind-merge"

export const Sheet = DialogPrimitive.Root
export const SheetTrigger = DialogPrimitive.Trigger
export const SheetClose = DialogPrimitive.Close

export function SheetContent(
  {
    side = "left",
    className,
    children,
    ...props
  }: { side?: "left" | "right" | "top" | "bottom" } & DialogPrimitive.DialogContentProps
) {
  const sideClasses =
    side === "left"
      ? "left-0 h-full w-80 border-r"
      : side === "right"
      ? "right-0 h-full w-80 border-l"
      : side === "top"
      ? "top-0 w-full border-b"
      : "bottom-0 w-full border-t"

  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-40 bg-black/30 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
      <DialogPrimitive.Content
        className={twMerge(
          "fixed z-50 bg-card text-fg p-4 outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-left",
          sideClasses,
          className
        )}
        {...props}
      >
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  )
}
