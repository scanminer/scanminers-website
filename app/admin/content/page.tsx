"use client"

import * as React from "react"
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type Row = { id: string; title: string; type: "Insight" | "Case Study"; updatedAt: string; status: "Draft" | "Published" }

const columns: ColumnDef<Row>[] = [
  { header: "Title", accessorKey: "title" },
  { header: "Type", accessorKey: "type" },
  { header: "Updated", accessorKey: "updatedAt" },
  { header: "Status", accessorKey: "status" },
]

const seed: Row[] = [
  { id: "1", title: "Dynamic Strategy Engine", type: "Insight", updatedAt: "2025-10-01", status: "Published" },
  { id: "2", title: "Scanminers — Case Study", type: "Case Study", updatedAt: "2025-09-21", status: "Draft" },
]

export default function ContentTable() {
  const [data] = React.useState<Row[]>(seed)
  const [query, setQuery] = React.useState("")

  const table = useReactTable({
    data: data.filter(d => d.title.toLowerCase().includes(query.toLowerCase())),
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Input placeholder="Search content…" value={query} onChange={(e) => setQuery(e.target.value)} className="max-w-xs" />
        <Button className="uppercase tracking-wide">New</Button>
      </div>
      <div className="rounded-2xl border bg-card shadow-soft overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-bg/60">
            {table.getHeaderGroups().map(hg => (
              <tr key={hg.id} className="border-b">
                {hg.headers.map(h => (
                  <th key={h.id} className="text-left px-3 py-2 font-medium uppercase tracking-wide text-muted">
                    {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map(r => (
              <tr key={r.id} className="border-b hover:bg-bg/40">
                {r.getVisibleCells().map(c => (
                  <td key={c.id} className="px-3 py-2">
                    {flexRender(c.column.columnDef.cell, c.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
