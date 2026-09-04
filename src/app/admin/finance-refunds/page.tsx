"use client";

import { useState, useEffect, useCallback } from "react";
import { RotateCcw, Loader2, CheckCircle2 } from "lucide-react";

interface RefundRecord {
  id: string;
  orderDbId: string;
  orderId: string;
  customer: string;
  amount: number;
  gateway: string;
  status: "COMPLETED" | "PENDING";
  date: string;
}

export default function AdminFinanceRefundsPage() {
  const [refunds, setRefunds] = useState<RefundRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchRealRefunds = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/finance-refunds", { cache: "no-store" });
      const data = await res.json();
      if (data.success && Array.isArray(data.refunds)) {
        setRefunds(data.refunds);
      }
    } catch {
      console.error("Failed to load refunds");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchRealRefunds();
  }, [fetchRealRefunds]);

  const handleProcessRefund = async (record: RefundRecord) => {
    if (!confirm(`Release refund of ₹${record.amount} for Order ${record.orderId}?`)) {
      return;
    }

    try {
      setProcessingId(record.id);
      const res = await fetch("/api/admin/finance-refunds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderDbId: record.orderDbId }),
      });

      const data = await res.json();
      if (data.success) {
        setRefunds((prev) =>
          prev.map((r) => (r.id === record.id ? { ...r, status: "COMPLETED" } : r))
        );
        alert("Refund released successfully!");
      } else {
        alert(data.error || "Failed to release refund");
      }
    } catch {
      alert("Network error processing refund");
    } finally {
      setProcessingId(null);
    }
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
        {loading ? (
          <div className="py-16 text-center text-slate-500 flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-7 h-7 animate-spin text-emerald-600" />
            <span className="text-xs font-bold">Loading real refund data...</span>
          </div>
        ) : refunds.length === 0 ? (
          <div className="py-16 text-center text-slate-500 space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
            <p className="text-xs font-black text-slate-900">No Refunds Found</p>
            <p className="text-xs text-slate-500 font-medium">
              Real-time refunds will appear here automatically when orders are marked as returned or cancelled.
            </p>
          </div>
        ) : (
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
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                        r.status === "COMPLETED"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    {r.status === "PENDING" && (
                      <button
                        onClick={() => handleProcessRefund(r)}
                        disabled={processingId === r.id}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] cursor-pointer inline-flex items-center gap-1 disabled:opacity-50"
                      >
                        {processingId === r.id && <Loader2 className="w-3 h-3 animate-spin" />}
                        Release Refund
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}