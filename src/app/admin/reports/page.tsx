"use client";

import { FileSpreadsheet, Download } from "lucide-react";

export default function AdminReportsPage() {
  const reports = [
    { title: "Monthly GST Tax Report (GSTR-1)", format: "CSV / Excel", period: "August 2026" },
    { title: "Consolidated Sales & Fulfillment Report", format: "Excel (.xlsx)", period: "Last 30 Days" },
    { title: "Inventory Valuation & Stock Levels", format: "CSV", period: "Live Real-Time" },
  ];

  const handleExport = (title: string) => {
    alert(`Downloading ${title}...`);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
          <FileSpreadsheet className="w-6 h-6 text-emerald-600" /> Export Accounting &amp; Audit Reports
        </h1>
        <p className="text-xs text-slate-500 font-semibold mt-0.5">
          Generate download-ready spreadsheets for tax compliance, accounting audits, and courier reconciliation.
        </p>
      </div>

      <div className="space-y-3">
        {reports.map((r, idx) => (
          <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-slate-900">{r.title}</h3>
              <p className="text-xs text-slate-500 font-medium">Period: {r.period} • File Type: {r.format}</p>
            </div>
            <button
              onClick={() => handleExport(r.title)}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" /> Download Export
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}