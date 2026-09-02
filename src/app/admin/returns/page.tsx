"use client";

import { useState } from "react";
import { RotateCcw, CheckCircle2, Clock, XCircle, Search } from "lucide-react";

export default function AdminReturnsPage() {
  const [returns, setReturns] = useState([
    {
      id: "RET-8921",
      orderId: "CB-78192",
      customer: "Vikram Mehta",
      reason: "Damaged packaging in transit",
      amount: 1499,
      status: "UNDER_REVIEW",
      date: "02 Sep 2026",
    },
    {
      id: "RET-8922",
      orderId: "CB-78104",
      customer: "Neha Verma",
      reason: "Received incorrect color/variant",
      amount: 799,
      status: "APPROVED",
      date: "01 Sep 2026",
    },
  ]);

  const handleAction = (id: string, newStatus: string) => {
    setReturns((prev) => prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r)));
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
          <RotateCcw className="w-6 h-6 text-emerald-600" /> Return &amp; Replacement Desk
        </h1>
        <p className="text-xs text-slate-500 font-semibold mt-0.5">
          Process 7-day customer replacement requests and reverse logistics dispatch.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-black uppercase">
            <tr>
              <th className="p-4">Return ID &amp; Date</th>
              <th className="p-4">Order ID</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Reason</th>
              <th className="p-4">Amount</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
            {returns.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/60 transition">
                <td className="p-4 font-mono font-bold text-slate-900">{item.id}</td>
                <td className="p-4 font-mono text-emerald-600 font-bold">{item.orderId}</td>
                <td className="p-4 font-bold text-slate-900">{item.customer}</td>
                <td className="p-4 text-slate-600">{item.reason}</td>
                <td className="p-4 font-black">₹{item.amount}</td>
                <td className="p-4">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                    item.status === "APPROVED"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-amber-100 text-amber-800"
                  }`}>
                    {item.status}
                  </span>
                </td>
                <td className="p-4 text-right space-x-2">
                  <button
                    onClick={() => handleAction(item.id, "APPROVED")}
                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold cursor-pointer"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleAction(item.id, "REJECTED")}
                    className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-[11px] font-bold cursor-pointer"
                  >
                    Reject
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}