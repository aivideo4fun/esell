"use client";

import { useState, useEffect } from "react";
import { RefreshCw, Loader2, RotateCcw, Check, X, ShieldAlert } from "lucide-react";

interface ReturnRequest {
  id: string;
  orderNumber: string;
  customerName: string;
  phone: string;
  reason: string;
  amount: number;
  status: "UNDER_REVIEW" | "APPROVED" | "REJECTED";
  createdAt: string;
}

export default function ReturnsRefundsPage() {
  const [requests, setRequests] = useState<ReturnRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);

  const fetchReturns = async () => {
    try {
      setLoading(true);
      // Fetch cancelled or returned orders from database
      const res = await fetch("/api/admin/orders");
      const data = await res.json();
      if (data.success && Array.isArray(data.orders)) {
        // Orders jinka status CANCELLED hai ya customer ne replacement request kiya hai
        const returnOrders = data.orders
          .filter((o: any) => o.orderStatus === "CANCELLED" || o.status === "CANCELLED")
          .map((o: any) => ({
            id: `RET-${o.id.slice(-4).toUpperCase()}`,
            orderNumber: o.orderNumber || o.id.slice(-6).toUpperCase(),
            customerName: o.address?.fullName || o.user?.name || "Customer",
            phone: o.address?.phone || o.user?.phone || "N/A",
            reason: "Customer requested cancellation / replacement",
            amount: o.totalAmount,
            status: "UNDER_REVIEW" as const,
            createdAt: o.createdAt,
          }));

        setRequests(returnOrders);
      }
    } catch {
      console.error("Failed to load return requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchReturns();
  }, []);

  const handleAction = async (id: string, newStatus: "APPROVED" | "REJECTED") => {
    setActionId(id);
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
    );
    setTimeout(() => setActionId(null), 600);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-6 px-4 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-950 flex items-center gap-2">
            <RotateCcw className="w-6 h-6 text-emerald-600" /> Return &amp; Replacement Desk
          </h1>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            Process customer replacement requests and reverse logistics dispatch.
          </p>
        </div>
        <button
          onClick={fetchReturns}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer shadow-2xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-500 flex flex-col items-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
            <span className="text-xs font-bold">Checking return requests...</span>
          </div>
        ) : requests.length === 0 ? (
          <div className="py-16 text-center text-slate-500 space-y-2">
            <RotateCcw className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs font-black text-slate-950">No pending returns or replacements.</p>
            <p className="text-xs text-slate-400">When customers request returns or cancel orders, they appear here.</p>
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-black uppercase tracking-wider">
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
            <tbody className="divide-y divide-slate-100 font-bold text-slate-900">
              {requests.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/60 transition">
                  <td className="p-4">
                    <span className="font-mono text-slate-900 block">{r.id}</span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      {new Date(r.createdAt).toLocaleDateString("en-IN")}
                    </span>
                  </td>
                  <td className="p-4 font-mono text-emerald-600 font-black">
                    #{r.orderNumber}
                  </td>
                  <td className="p-4">
                    <span className="block text-slate-900">{r.customerName}</span>
                    <span className="text-[10px] text-slate-400 font-normal">{r.phone}</span>
                  </td>
                  <td className="p-4 text-slate-600 font-medium max-w-[200px] truncate">
                    {r.reason}
                  </td>
                  <td className="p-4 font-black text-slate-950">
                    ₹{r.amount.toLocaleString("en-IN")}
                  </td>
                  <td className="p-4">
                    <span
                      className={`inline-block px-2.5 py-1 text-[10px] font-black rounded-lg border ${
                        r.status === "APPROVED"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : r.status === "REJECTED"
                          ? "bg-rose-50 text-rose-700 border-rose-200"
                          : "bg-amber-50 text-amber-800 border-amber-200"
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-1.5">
                    <button
                      onClick={() => handleAction(r.id, "APPROVED")}
                      disabled={actionId === r.id}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition cursor-pointer"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleAction(r.id, "REJECTED")}
                      disabled={actionId === r.id}
                      className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold transition cursor-pointer"
                    >
                      Reject
                    </button>
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