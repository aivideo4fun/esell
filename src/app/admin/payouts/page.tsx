"use client";

import { useState } from "react";
import { Wallet, CheckCircle2 } from "lucide-react";

interface PayoutRecord {
  id: string;
  vendor: string;
  amount: number;
  account: string;
  status: "SETTLED" | "SCHEDULED";
  dueDate: string;
}

export default function AdminPayoutsPage() {
  const [payouts, setPayouts] = useState<PayoutRecord[]>([
    { id: "PO-301", vendor: "Apex Gadgets Logistics", amount: 48500, account: "HDFC Bank ****9812", status: "SETTLED", dueDate: "30 Aug 2026" },
    { id: "PO-302", vendor: "Zenith Home Crafts", amount: 22400, account: "ICICI Bank ****4431", status: "SCHEDULED", dueDate: "05 Sep 2026" },
  ]);

  const handleSettle = (id: string) => {
    setPayouts((prev) => prev.map((p) => (p.id === id ? { ...p, status: "SETTLED" } : p)));
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
          <Wallet className="w-6 h-6 text-emerald-600" /> Supplier &amp; Vendor Payouts
        </h1>
        <p className="text-xs text-slate-500 font-semibold mt-0.5">
          Schedule and reconcile procurement invoice settlements for external product suppliers.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-black uppercase">
            <tr>
              <th className="p-4">Payout ID</th>
              <th className="p-4">Vendor</th>
              <th className="p-4">Settlement Amount</th>
              <th className="p-4">Bank Account</th>
              <th className="p-4">Due Date</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
            {payouts.map((p) => (
              <tr key={p.id}>
                <td className="p-4 font-mono font-bold text-slate-900">{p.id}</td>
                <td className="p-4 font-bold text-slate-900">{p.vendor}</td>
                <td className="p-4 font-black text-emerald-700">₹{p.amount.toLocaleString("en-IN")}</td>
                <td className="p-4 text-slate-600 font-mono">{p.account}</td>
                <td className="p-4 text-slate-500">{p.dueDate}</td>
                <td className="p-4">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                    p.status === "SETTLED" ? "bg-emerald-100 text-emerald-800" : "bg-blue-100 text-blue-800"
                  }`}>
                    {p.status}
                  </span>
                </td>
                <td className="p-4 text-right">
                  {p.status === "SCHEDULED" && (
                    <button
                      onClick={() => handleSettle(p.id)}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] cursor-pointer"
                    >
                      Mark Paid
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