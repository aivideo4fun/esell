"use client";

import { useEffect, useState } from "react";
import {
  CreditCard,
  Search,
  RefreshCw,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  TrendingUp,
  Receipt
} from "lucide-react";
import Link from "next/link";

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL"); // ALL, COMPLETED, FAILED, PENDING

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/payments");
      const data = await res.json();
      if (data.success) {
        setPayments(data.payments || []);
      }
    } catch (err) {
      console.error("Failed to load payments ledger", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  // Metrics
  const totalSettledAmount = payments
    .filter((p) => p.status === "COMPLETED" || p.status === "SUCCESS")
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const completedCount = payments.filter(
    (p) => p.status === "COMPLETED" || p.status === "SUCCESS"
  ).length;
  const failedCount = payments.filter((p) => p.status === "FAILED").length;
  const pendingCount = payments.filter((p) => p.status === "PENDING").length;

  const filteredPayments = payments.filter((p) => {
    const customerName =
      p.order?.address?.fullName || p.order?.customer?.name || "";
    const phone =
      p.order?.address?.phone || p.order?.customer?.phone || "";
    const matchesSearch =
      p.gatewayTxnId?.toLowerCase().includes(search.toLowerCase()) ||
      p.order?.orderNumber?.toLowerCase().includes(search.toLowerCase()) ||
      customerName.toLowerCase().includes(search.toLowerCase()) ||
      phone.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;
    if (filter === "COMPLETED") return p.status === "COMPLETED" || p.status === "SUCCESS";
    if (filter === "FAILED") return p.status === "FAILED";
    if (filter === "PENDING") return p.status === "PENDING";
    return true;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-6 px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-950">Payments &amp; Transactions Ledger</h1>
          <p className="text-xs text-slate-600 font-semibold mt-1">
            Real-time transaction log, gateway references, settled revenue, and audit trail.
          </p>
        </div>
        <button
          onClick={fetchPayments}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 transition cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Settled Revenue</p>
          <p className="text-2xl font-black text-slate-900">₹{totalSettledAmount.toLocaleString("en-IN")}</p>
          <p className="text-[10px] text-emerald-600 font-medium">100% verified gateway captured</p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <p className="text-[11px] font-black text-emerald-600 uppercase tracking-wider">Successful Txns</p>
          <p className="text-2xl font-black text-emerald-700">{completedCount}</p>
          <p className="text-[10px] text-slate-500 font-medium">Paid orders</p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <p className="text-[11px] font-black text-amber-600 uppercase tracking-wider">Pending Gateway</p>
          <p className="text-2xl font-black text-amber-700">{pendingCount}</p>
          <p className="text-[10px] text-amber-600 font-medium">Awaiting UPI confirmation</p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <p className="text-[11px] font-black text-rose-600 uppercase tracking-wider">Failed Attempts</p>
          <p className="text-2xl font-black text-rose-700">{failedCount}</p>
          <p className="text-[10px] text-rose-600 font-medium">Bank/UPI timeout</p>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {[
            { key: "ALL", label: "All Transactions" },
            { key: "COMPLETED", label: "Completed" },
            { key: "PENDING", label: "Pending" },
            { key: "FAILED", label: "Failed" },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setFilter(t.key)}
              className={`px-4 py-2 rounded-xl text-xs font-black shrink-0 transition cursor-pointer border ${
                filter === t.key
                  ? "bg-black text-white border-black"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search Txn ID, Order #, or Customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-emerald-600"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-500 flex flex-col items-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
            <span className="text-xs font-bold">Loading payment records...</span>
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="py-16 text-center text-slate-400 space-y-2">
            <Receipt className="w-8 h-8 mx-auto text-slate-300" />
            <p className="text-xs font-black text-slate-700">No payment records found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-4">Gateway Txn ID</th>
                  <th className="p-4">Order Details</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Gateway / Method</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Date &amp; Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-800">
                {filteredPayments.map((pay) => {
                  const customerName =
                    pay.order?.address?.fullName ||
                    pay.order?.customer?.name ||
                    "Direct Shopper";
                  const phone =
                    pay.order?.address?.phone ||
                    pay.order?.customer?.phone ||
                    "—";

                  return (
                    <tr key={pay.id} className="hover:bg-slate-50/60">
                      <td className="p-4">
                        <span className="font-mono text-xs font-black text-slate-900 bg-slate-100 px-2 py-1 rounded-md">
                          {pay.gatewayTxnId}
                        </span>
                      </td>

                      <td className="p-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-black text-slate-900">
                            #{pay.order?.orderNumber || (pay.orderId ? pay.orderId.slice(-6).toUpperCase() : "N/A")}
                          </span>
                          {pay.orderId && (
                            <Link
                              href="/admin/orders"
                              className="text-[10px] text-emerald-700 hover:underline inline-flex items-center"
                            >
                              <ArrowUpRight className="w-3 h-3" />
                            </Link>
                          )}
                        </div>
                        {pay.order?.couponCode && (
                          <span className="text-[10px] text-emerald-700 font-bold">
                            Promo: {pay.order.couponCode}
                          </span>
                        )}
                      </td>

                      <td className="p-4 space-y-0.5">
                        <p className="font-black text-xs text-slate-900">{customerName}</p>
                        <p className="text-[10px] text-slate-500 font-mono">{phone}</p>
                      </td>

                      <td className="p-4">
                        <span className="inline-flex items-center gap-1 font-bold text-slate-700 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md text-[11px]">
                          <CreditCard className="w-3 h-3 text-slate-400" />
                          {pay.gateway}
                        </span>
                      </td>

                      <td className="p-4 font-black text-slate-900">
                        ₹{pay.amount.toLocaleString("en-IN")}
                      </td>

                      <td className="p-4">
                        {pay.status === "COMPLETED" || pay.status === "SUCCESS" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-[10px] font-black uppercase">
                            <CheckCircle2 className="w-3 h-3" /> Captured
                          </span>
                        ) : pay.status === "PENDING" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-[10px] font-black uppercase">
                            <Clock className="w-3 h-3" /> Pending
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-[10px] font-black uppercase">
                            <XCircle className="w-3 h-3" /> Failed
                          </span>
                        )}
                      </td>

                      <td className="p-4 text-right text-slate-500 text-[11px] font-medium">
                        {new Date(pay.createdAt).toLocaleString("en-IN", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}