"use client";

import { useState } from "react";
import { Truck, Search, ShieldCheck } from "lucide-react";

export default function AdminOrderTrackPage() {
  const [awb, setAwb] = useState("");

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-slate-950 flex items-center gap-2">
          <Truck className="w-6 h-6 text-emerald-600" /> Courier &amp; Logistics Tracking
        </h1>
        <p className="text-xs text-slate-500 font-semibold mt-1">
          Monitor third-party courier dispatch, AWB states and delivery SLA performance.
        </p>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
        <input
          type="text"
          placeholder="Enter AWB or Order ID..."
          value={awb}
          onChange={(e) => setAwb(e.target.value)}
          className="w-full bg-transparent text-xs font-semibold text-slate-900 outline-none"
        />
        <button className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold shrink-0">
          Search AWB
        </button>
      </div>
    </div>
  );
}