"use client";

import { History } from "lucide-react";

export default function AdminLogsPage() {
  const logs = [
    { event: "ORDER_STATUS_UPDATE", detail: "Order #CB-8921 set to SHIPPED", user: "Teja Jat", time: "10 mins ago" },
    { event: "COUPON_GENERATED", detail: "Created discount code PREPAID50", user: "Teja Jat", time: "2 hours ago" },
    { event: "SUPPLIER_PAYOUT_CLEARED", detail: "Settled ₹48,500 to Apex Gadgets", user: "Teja Jat", time: "1 day ago" },
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
          <History className="w-6 h-6 text-emerald-600" /> Audit &amp; System Activity Logs
        </h1>
        <p className="text-xs text-slate-500 font-semibold mt-0.5">
          Immutable event log of administrative actions, data edits, and security changes.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="divide-y divide-slate-100">
          {logs.map((l, idx) => (
            <div key={idx} className="p-4 flex items-center justify-between text-xs">
              <div className="space-y-0.5">
                <span className="font-mono font-black text-emerald-700 text-[10px]">{l.event}</span>
                <p className="font-semibold text-slate-900">{l.detail}</p>
                <p className="text-[10px] text-slate-400">By: {l.user}</p>
              </div>
              <span className="text-[11px] text-slate-400 font-semibold">{l.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}