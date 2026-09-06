"use client";

import { useState, useEffect } from "react";
import { Truck, ShieldCheck, Loader2, Save, CheckCircle2 } from "lucide-react";

export default function AdminShippingPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const [rules, setRules] = useState({
    freeDeliveryMinOrder: 999,
    standardDeliveryFee: 60,
    prepaidDiscount: 50,
  });

  useEffect(() => {
    fetch("/api/admin/shipping")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.rules) {
          setRules(data.rules);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg("");

    try {
      const res = await fetch("/api/admin/shipping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rules),
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg("Shipping rules updated & applied live across storefront!");
        setTimeout(() => setSuccessMsg(""), 4000);
      } else {
        alert(data.message || "Failed to update rules");
      }
    } catch {
      alert("Error saving shipping rules");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-2">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        <p className="text-xs font-bold text-slate-500">Loading shipping rules...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto py-6 px-4 font-sans">
      <div>
        <h1 className="text-2xl font-black text-slate-950 flex items-center gap-2">
          <Truck className="w-6 h-6 text-emerald-600" /> Shipping &amp; Logistics Control
        </h1>
        <p className="text-xs text-slate-500 font-semibold mt-1">
          Configure delivery rates, free shipping thresholds, and prepaid checkout discounts.
        </p>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-2xl text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Form: Real Shipping Rules */}
        <form onSubmit={handleUpdate} className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">
              Checkout Shipping Rules
            </h2>
            <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">
              Live Configuration
            </span>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">
              Free Delivery Min Order Value (₹)
            </label>
            <input
              type="number"
              min={0}
              value={rules.freeDeliveryMinOrder}
              onChange={(e) => setRules({ ...rules, freeDeliveryMinOrder: Number(e.target.value) })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-emerald-600"
              required
            />
            <p className="text-[10px] text-slate-400">Orders above this amount will get free shipping automatically.</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">
              Standard Delivery Fee (₹)
            </label>
            <input
              type="number"
              min={0}
              value={rules.standardDeliveryFee}
              onChange={(e) => setRules({ ...rules, standardDeliveryFee: Number(e.target.value) })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-emerald-600"
              required
            />
            <p className="text-[10px] text-slate-400">Charged if order subtotal is below the threshold.</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">
              Prepaid Instant Discount (₹)
            </label>
            <input
              type="number"
              min={0}
              value={rules.prepaidDiscount}
              onChange={(e) => setRules({ ...rules, prepaidDiscount: Number(e.target.value) })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-emerald-600"
              required
            />
            <p className="text-[10px] text-slate-400">Instant off when customer pays online via UPI/Card.</p>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black transition flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Update Shipping Rules</span>
          </button>
        </form>

        {/* Right Card: Logistics Gateways */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">
              Integrated Logistics Gateways
            </h2>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-900">BlueDart Express</p>
                <p className="text-[10px] text-slate-400">Standard Surface Dispatch</p>
              </div>
              <span className="text-[10px] font-black px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg">ACTIVE</span>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-900">Delhivery Surface &amp; Air</p>
                <p className="text-[10px] text-slate-400">Pan-India Pincode Coverage</p>
              </div>
              <span className="text-[10px] font-black px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg">ACTIVE</span>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-900">Shiprocket API Engine</p>
                <p className="text-[10px] text-slate-400">Automated Courier Allocator</p>
              </div>
              <span className="text-[10px] font-black px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg">ACTIVE</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}