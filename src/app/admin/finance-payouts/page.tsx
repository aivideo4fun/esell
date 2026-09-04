"use client";

import { useState, useEffect, useCallback } from "react";
import { Wallet, Loader2, CheckCircle2, Plus, X } from "lucide-react";

interface PayoutRecord {
  id: string;
  payoutId: string;
  vendor: string;
  amount: number;
  bankAccount: string;
  dueDate: string;
  status: "SETTLED" | "SCHEDULED";
}

export default function SupplierPayoutsPage() {
  const [payouts, setPayouts] = useState<PayoutRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State for new payout
  const [form, setForm] = useState({
    vendorName: "",
    settlementAmount: "",
    bankAccount: "",
    dueDate: new Date().toISOString().split("T")[0],
  });

  const fetchPayouts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/finance-payouts", { cache: "no-store" });
      const data = await res.json();
      if (data.success && Array.isArray(data.payouts)) {
        setPayouts(data.payouts);
      }
    } catch {
      console.error("Failed to load supplier payouts");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchPayouts();
  }, [fetchPayouts]);

  const handleMarkPaid = async (record: PayoutRecord) => {
    if (!confirm(`Mark payout of ₹${record.amount.toLocaleString()} for ${record.vendor} as Settled?`)) {
      return;
    }

    try {
      setProcessingId(record.id);
      const res = await fetch("/api/admin/finance-payouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "MARK_PAID", payoutId: record.id }),
      });

      const data = await res.json();
      if (data.success) {
        setPayouts((prev) =>
          prev.map((p) => (p.id === record.id ? { ...p, status: "SETTLED" } : p))
        );
      } else {
        alert(data.error || "Failed to settle payout");
      }
    } catch {
      alert("Network error marking payout settled");
    } finally {
      setProcessingId(null);
    }
  };

  const handleCreatePayout = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/finance-payouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "CREATE", ...form }),
      });

      const data = await res.json();
      if (data.success) {
        setShowAddModal(false);
        setForm({
          vendorName: "",
          settlementAmount: "",
          bankAccount: "",
          dueDate: new Date().toISOString().split("T")[0],
        });
        void fetchPayouts();
      } else {
        alert(data.error || "Failed to schedule payout");
      }
    } catch {
      alert("Network error scheduling payout");
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-950 flex items-center gap-2">
            <Wallet className="w-6 h-6 text-emerald-600" /> Supplier &amp; Vendor Payouts
          </h1>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">
            Schedule and reconcile procurement invoice settlements for external product suppliers.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black rounded-xl transition cursor-pointer shadow-xs"
        >
          <Plus className="w-4 h-4" /> Schedule Payout
        </button>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-black text-slate-950 text-sm">Schedule New Vendor Payout</h3>
            <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          </div>
          <form onSubmit={handleCreatePayout} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold">
            <div>
              <label className="text-slate-700 block mb-1">Vendor / Supplier Name</label>
              <input
                required
                type="text"
                placeholder="e.g. Apex Gadgets Logistics"
                value={form.vendorName}
                onChange={(e) => setForm({ ...form, vendorName: e.target.value })}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-emerald-600"
              />
            </div>
            <div>
              <label className="text-slate-700 block mb-1">Settlement Amount (₹)</label>
              <input
                required
                type="number"
                placeholder="48500"
                value={form.settlementAmount}
                onChange={(e) => setForm({ ...form, settlementAmount: e.target.value })}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-emerald-600"
              />
            </div>
            <div>
              <label className="text-slate-700 block mb-1">Bank / Settlement Details</label>
              <input
                required
                type="text"
                placeholder="e.g. HDFC Bank ****9812"
                value={form.bankAccount}
                onChange={(e) => setForm({ ...form, bankAccount: e.target.value })}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-emerald-600"
              />
            </div>
            <div>
              <label className="text-slate-700 block mb-1">Due Date</label>
              <input
                required
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-emerald-600"
              />
            </div>
            <div className="sm:col-span-2 flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-black cursor-pointer shadow-xs"
              >
                Save Payout
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Main Table Matching Screenshot */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-500 flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-7 h-7 animate-spin text-emerald-600" />
            <span className="text-xs font-bold">Loading settlements...</span>
          </div>
        ) : payouts.length === 0 ? (
          <div className="py-16 text-center text-slate-500 space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
            <p className="text-xs font-black text-slate-900">No Payout Records</p>
            <p className="text-xs text-slate-500 font-medium">
              Use the "Schedule Payout" button above to add procurement settlements.
            </p>
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-700 font-black uppercase tracking-wider">
              <tr>
                <th className="p-4 pl-6">PAYOUT ID</th>
                <th className="p-4">VENDOR</th>
                <th className="p-4">SETTLEMENT AMOUNT</th>
                <th className="p-4">BANK ACCOUNT</th>
                <th className="p-4">DUE DATE</th>
                <th className="p-4">STATUS</th>
                <th className="p-4 text-right pr-6">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-bold text-slate-900">
              {payouts.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/60 transition">
                  <td className="p-4 pl-6 font-black text-slate-950">{p.payoutId}</td>
                  <td className="p-4 text-slate-900">{p.vendor}</td>
                  <td className="p-4 font-black text-emerald-700 text-sm">₹{p.amount.toLocaleString()}</td>
                  <td className="p-4 text-slate-600 font-medium">{p.bankAccount}</td>
                  <td className="p-4 text-slate-600 font-medium">{p.dueDate}</td>
                  <td className="p-4">
                    {p.status === "SETTLED" ? (
                      <span className="inline-block px-3 py-1 bg-emerald-100/70 text-emerald-800 text-[10px] font-black uppercase rounded-full">
                        SETTLED
                      </span>
                    ) : (
                      <span className="inline-block px-3 py-1 bg-blue-100/70 text-blue-800 text-[10px] font-black uppercase rounded-full">
                        SCHEDULED
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right pr-6">
                    {p.status === "SCHEDULED" && (
                      <button
                        onClick={() => handleMarkPaid(p)}
                        disabled={processingId === p.id}
                        className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-black transition cursor-pointer shadow-xs disabled:opacity-50 inline-flex items-center gap-1"
                      >
                        {processingId === p.id && <Loader2 className="w-3 h-3 animate-spin" />}
                        Mark Paid
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