"use client";

import { useState } from "react";
import { RotateCcw } from "lucide-react";

interface RefundRecord {
  id: string;
  orderId: string;
  customer: string;
  amount: number;
  gateway: string;
  status: "COMPLETED" | "PENDING";
  date: string;
}

export default function AdminFinanceRefundsPage() {
  const [refunds, setRefunds] = useState<RefundRecord[]>([
    {
      id: "RF-9012",
      orderId: "CB-8921",
      customer: "Rahul Sharma",
      amount: 1499,
      gateway: "Razorpay (UPI)",
      status: "COMPLETED",
      date: "01 Sep 2026",
    },
    {
      id: "RF-9013",
      orderId: "CB-8930",
      customer: "Kavita Rao",
      amount: 799,
      gateway: "Net Banking",
      status: "PENDING",
      date: "02 Sep 2026",
    },
  ]);

  const handleProcessRefund = (id: string) => {
    setRefunds((prev) => prev.map((r) => (r.id === id ? { ...r, status: "COMPLETED" } : r)));
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
          <RotateCcw className="w-6 h-6 text-emerald-600" /> Gateway Refunds &amp; Reversals
        </h1>
        <p className="text-xs text-slate-500 font-semibold mt-0.5">
          Process customer refunds back to source bank accounts via payment gateway APIs.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-black uppercase">
            <tr>
              <th className="p-4">Refund ID</th>
              <th className="p-4">Order Ref</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Amount</th>
              <th className="p-4">Method</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
            {refunds.map((r) => (
              <tr key={r.id} className="hover:bg-slate-50/60 transition">
                <td className="p-4 font-mono font-bold text-slate-900">{r.id}</td>
                <td className="p-4 font-mono text-emerald-600 font-bold">{r.orderId}</td>
                <td className="p-4 font-bold text-slate-900">{r.customer}</td>
                <td className="p-4 font-black">₹{r.amount}</td>
                <td className="p-4 text-slate-600">{r.gateway}</td>
                <td className="p-4">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                    r.status === "COMPLETED" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                  }`}>
                    {r.status}
                  </span>
                </td>
                <td className="p-4 text-right">
                  {r.status === "PENDING" && (
                    <button
                      onClick={() => handleProcessRefund(r.id)}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] cursor-pointer"
                    >
                      Release Refund
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}