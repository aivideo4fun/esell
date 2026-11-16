"use client";
import { useEffect, useState } from "react";
export default function AdminStatusTable({ title, endpoint, field }: { title: string; endpoint: string; field: string }) {
  const [rows, setRows] = useState<Record<string, unknown>[]>([]); const [message, setMessage] = useState("Loading…");
  useEffect(() => { fetch(endpoint).then((r) => r.json()).then((d) => { if (!d.success) throw new Error(d.error || "Unable to load"); setRows(d[field]); setMessage(d.note || ""); }).catch((e) => setMessage(e.message)); }, [endpoint, field]);
  const columns = rows.length ? Object.keys(rows[0]) : [];
  return <section className="p-6 space-y-4"><h1 className="text-2xl font-bold">{title}</h1><p role="status">{message || (!rows.length ? "No records yet." : "")}</p><div className="overflow-auto"><table className="w-full bg-white border text-sm"><thead><tr>{columns.map((c) => <th className="text-left p-3 border-b" key={c}>{c}</th>)}</tr></thead><tbody>{rows.map((r, i) => <tr key={i}>{columns.map((c) => <td className="p-3 border-b" key={c}>{typeof r[c] === "boolean" ? r[c] ? "Configured" : "Not configured" : String(r[c] ?? "")}</td>)}</tr>)}</tbody></table></div></section>;
}
