"use client";

import { useState, useEffect, useCallback } from "react";
import { RefreshCw, Loader2, RotateCcw, Check, X, Phone, User, Calendar } from "lucide-react";

interface ReturnRequest {
  id: string;
  orderId: string;
  orderNumber: string;
  customerName: string;
  phone: string;
  reason: string;
  comments: string;
  amount: number;
  status: "UNDER_REVIEW" | "APPROVED" | "REJECTED";
  createdAt: string;
}

export default function ReturnsRefundsPage() {
  const [requests, setRequests] = useState<ReturnRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);

  const fetchReturns = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/orders", { cache: "no-store" });
      const data = await res.json();

      if (data.success && Array.isArray(data.orders)) {
        // RETURN_REQUESTED, CANCELLED, ya trackingUrl me [RETURN_REQUESTED] wale orders filter karein
        const returnOrders = data.orders
          .filter((o: any) => {
            const st = (o.orderStatus || o.status || "").toUpperCase();
            const track = (o.trackingUrl || "").toUpperCase();
            return (
              st === "RETURN_REQUESTED" ||
              st === "CANCELLED" ||
              st === "REFUNDED" ||
              track.includes("RETURN_REQUESTED")
            );
          })
          .map((o: any) => {
            let reasonText = "Customer requested return / replacement";
            let commentText = "";

            // Parse reason and comments from trackingUrl note
            if (o.trackingUrl && o.trackingUrl.includes("[RETURN_REQUESTED]:")) {
              const notePart = o.trackingUrl.replace("[RETURN_REQUESTED]:", "").split("|")[0]?.trim();
              if (notePart) reasonText = notePart;

              if (o.trackingUrl.includes("Note:")) {
                commentText = o.trackingUrl.split("Note:")[1]?.split("|")[0]?.trim() || "";
              }
            }

            return {
              id: `RET-${o.id.slice(-4).toUpperCase()}`,
              orderId: o.id,
              orderNumber: o.orderNumber || o.id.slice(-6).toUpperCase(),
              customerName: o.address?.fullName || o.user?.name || "Direct Customer",
              phone: o.address?.phone || o.user?.phone || "N/A",
              reason: reasonText,
              comments: commentText,
              amount: o.totalAmount,
              status: (o.orderStatus === "CANCELLED" || o.paymentStatus === "REFUNDED"
                ? "APPROVED"
                : "UNDER_REVIEW") as "UNDER_REVIEW" | "APPROVED" | "REJECTED",
              createdAt: o.createdAt,
            };
          });

        setRequests(returnOrders);
      }
    } catch (err) {
      console.error("Failed to load real refund records:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchReturns();
  }, [fetchReturns]);

  const handleAction = async (item: ReturnRequest, newStatus: "APPROVED" | "REJECTED") => {
    try {
      setActionId(item.id);
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: item.orderId,
          orderStatus: newStatus === "APPROVED" ? "CANCELLED" : "DELIVERED",
          supplierStatus: newStatus === "APPROVED" ? "REFUND_APPROVED" : "RETURN_REJECTED",
        }),
      });

      const data = await res.json();
      if (data.success) {
        setRequests((prev) =>
          prev.map((r) => (r.id === item.id ? { ...r, status: newStatus } : r))
        );
        alert(`Return appeal #${item.orderNumber} ${newStatus === "APPROVED" ? "Approved! Refund initiated." : "Rejected."}`);
      } else {
        alert(data.error || "Action failed");
      }
    } catch {
      alert("Status update failed");
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-6 px-4 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-950 flex items-center gap-2">
            <RotateCcw className="w-6 h-6 text-emerald-600" /> Return &amp; Replacement Desk
          </h1>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            Process real-time customer replacement requests and reverse logistics dispatch.
          </p>
        </div>
        <button
          onClick={() => void fetchReturns()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer shadow-2xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-500 flex flex-col items-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
            <span className="text-xs font-bold">Checking real database returns...</span>
          </div>
        ) : requests.length === 0 ? (
          <div className="py-16 text-center text-slate-500 space-y-2">
            <RotateCcw className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs font-black text-slate-950">No pending returns or replacements.</p>
            <p className="text-xs text-slate-400">
              When customers submit return appeals from order tracking, they appear here live.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-black uppercase tracking-wider">
                <tr>
                  <th className="p-4">Return ID &amp; Date</th>
                  <th className="p-4">Order ID</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Reason &amp; Customer Note</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-bold text-slate-900">
                {requests.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/60 transition">
                    <td className="p-4 align-top">
                      <span className="font-mono text-slate-900 block">{r.id}</span>
                      <span className="text-[10px] text-slate-400 font-normal">
                        {new Date(r.createdAt).toLocaleDateString("en-IN")}
                      </span>
                    </td>

                    <td className="p-4 align-top">
                      <span className="font-mono text-emerald-600 font-black">
                        #{r.orderNumber}
                      </span>
                    </td>

                    <td className="p-4 align-top space-y-0.5">
                      <span className="block text-slate-900 font-bold">{r.customerName}</span>
                      <span className="text-[10px] text-slate-500 font-semibold flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" /> {r.phone}
                      </span>
                    </td>

                    <td className="p-4 align-top max-w-[260px]">
                      <span className="text-slate-900 block font-semibold">{r.reason}</span>
                      {r.comments && (
                        <span className="text-[11px] text-slate-500 italic block mt-0.5 bg-slate-50 p-1.5 rounded-lg border border-slate-200">
                          &ldquo;{r.comments}&rdquo;
                        </span>
                      )}
                    </td>

                    <td className="p-4 align-top font-black text-slate-950">
                      ₹{r.amount.toLocaleString("en-IN")}
                    </td>

                    <td className="p-4 align-top">
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

                    <td className="p-4 align-top text-right space-x-1.5 whitespace-nowrap">
                      {r.status === "UNDER_REVIEW" ? (
                        <>
                          <button
                            onClick={() => handleAction(r, "APPROVED")}
                            disabled={actionId === r.id}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black transition cursor-pointer shadow-2xs disabled:opacity-50"
                          >
                            {actionId === r.id ? "..." : "Approve"}
                          </button>
                          <button
                            onClick={() => handleAction(r, "REJECTED")}
                            disabled={actionId === r.id}
                            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-black transition cursor-pointer disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </>
                      ) : (
                        <span className="text-[11px] text-slate-400 font-bold">Processed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}