"use client";

import { useEffect, useState } from "react";
import { onToast } from "@/lib/toast";

type Item = { id: number; msg: string; type?: "success" | "error" };

export function Toaster() {
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    let id = 0;
    return onToast((msg, type) => {
      const next: Item = { id: ++id, msg, type };
      setItems((prev) => [...prev, next]);
      setTimeout(() => setItems((prev) => prev.filter((i) => i.id !== next.id)), 3000);
    });
  }, []);

  if (!items.length) return null;
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {items.map((i) => (
        <div
          key={i.id}
          className={
            "min-w-[220px] rounded-md border px-3 py-2 text-sm shadow " +
            (i.type === "error"
              ? "border-red-300 bg-red-50 text-red-900"
              : "border-emerald-300 bg-emerald-50 text-emerald-900")
          }
        >
          {i.msg}
        </div>
      ))}
    </div>
  );
}
