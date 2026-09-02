"use client";

import { useState } from "react";
import { FileText, Plus, ExternalLink, CheckCircle2 } from "lucide-react";
import Link from "next/link";

interface StaticPage {
  id: string;
  title: string;
  slug: string;
  status: "ACTIVE" | "DRAFT";
  lastModified: string;
}

export default function AdminPagesManager() {
  const [pages] = useState<StaticPage[]>([
    { id: "PG-1", title: "About Us", slug: "/about", status: "ACTIVE", lastModified: "Aug 2026" },
    { id: "PG-2", title: "Terms & Conditions", slug: "/terms", status: "ACTIVE", lastModified: "Jul 2026" },
    { id: "PG-3", title: "Privacy Policy", slug: "/privacy", status: "ACTIVE", lastModified: "Jul 2026" },
    { id: "PG-4", title: "Shipping & Return Policy", slug: "/shipping-policy", status: "ACTIVE", lastModified: "Aug 2026" },
  ]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-emerald-600" /> Storefront Static Pages
          </h1>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">
            Manage legal, policies, about, and custom landing page templates.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-black uppercase">
            <tr>
              <th className="p-4">Page Title</th>
              <th className="p-4">URL Route</th>
              <th className="p-4">Last Updated</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">View Live</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
            {pages.map((pg) => (
              <tr key={pg.id} className="hover:bg-slate-50/60 transition">
                <td className="p-4 font-bold text-slate-900">{pg.title}</td>
                <td className="p-4 font-mono text-emerald-600 font-bold">{pg.slug}</td>
                <td className="p-4 text-slate-500">{pg.lastModified}</td>
                <td className="p-4">
                  <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3" /> {pg.status}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <Link
                    href={pg.slug}
                    target="_blank"
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold transition"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Preview
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}