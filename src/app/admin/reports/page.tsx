"use client";
import { useState } from "react";
export default function Reports() {
  const [message, setMessage] = useState("");
  async function download(kind: string) {
    setMessage("");
    try { const r = await fetch(`/api/admin/exports?kind=${kind}`); if (!r.ok) throw new Error("Export failed. Check your admin session.");
      const url = URL.createObjectURL(await r.blob()); const a = document.createElement("a"); a.href = url; a.download = `catchbuddy-${kind}.csv`; a.click(); URL.revokeObjectURL(url);
    } catch (e) { setMessage(e instanceof Error ? e.message : "Export failed"); }
  }
  return <section className="p-6 max-w-4xl space-y-5"><h1 className="text-2xl font-bold">Export recorded data</h1><p>CSV files contain up to 10,000 database records. These are operational exports, not certified GST returns or profit statements.</p>{message && <p role="alert">{message}</p>}{["orders", "products", "customers", "payments"].map((kind) => <div key={kind} className="flex justify-between border rounded-xl bg-white p-5"><span className="capitalize">{kind}</span><button className="bg-emerald-700 text-white px-4 py-2 rounded-lg" onClick={() => void download(kind)}>Download CSV</button></div>)}</section>;
}
