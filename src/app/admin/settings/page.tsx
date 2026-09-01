"use client";

import { useEffect, useState } from "react";
import {
  Settings as SettingsIcon,
  Store,
  ShieldCheck,
  Truck,
  Percent,
  Phone,
  Mail,
  Save,
  Loader2,
  CheckCircle2
} from "lucide-react";

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Settings form states
  const [storeName, setStoreName] = useState("CatchBuddy");
  const [supportEmail, setSupportEmail] = useState("support@catchbuddy.com");
  const [supportPhone, setSupportPhone] = useState("+91 9876543210");
  const [prepaidDiscount, setPrepaidDiscount] = useState("50");
  const [enablePrepaidDiscount, setEnablePrepaidDiscount] = useState(true);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState("0");

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/admin/settings");
        const data = await res.json();
        if (data.success && data.settings) {
          setStoreName(data.settings.storeName || "CatchBuddy");
          setSupportEmail(data.settings.supportEmail || "support@catchbuddy.com");
          setSupportPhone(data.settings.supportPhone || "+91 9876543210");
          setPrepaidDiscount(String(data.settings.prepaidDiscount ?? 50));
          setEnablePrepaidDiscount(data.settings.enablePrepaidDiscount ?? true);
          setFreeShippingThreshold(String(data.settings.freeShippingThreshold ?? 0));
        }
      } catch (err) {
        console.error("Failed to load settings", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setSaveSuccess(false);

      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeName,
          supportEmail,
          supportPhone,
          prepaidDiscount: Number(prepaidDiscount),
          enablePrepaidDiscount,
          freeShippingThreshold: Number(freeShippingThreshold),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        alert(data.error || "Failed to update settings");
      }
    } catch {
      alert("Error saving settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        <p className="text-xs font-bold text-slate-500">Loading store settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-6 px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-950">Store Settings &amp; Rules</h1>
          <p className="text-xs text-slate-600 font-semibold mt-1">
            Configure store identity, support contacts, checkout discounts, and courier settings.
          </p>
        </div>
        {saveSuccess && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-black">
            <CheckCircle2 className="w-4 h-4" /> Settings Saved!
          </span>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Store Identity */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-5">
          <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
            <Store className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-black text-slate-900">Brand &amp; Contact Info</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Store Name</label>
              <input
                type="text"
                required
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" /> Support Email
              </label>
              <input
                type="email"
                required
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-slate-700 block mb-1 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" /> WhatsApp / Helpdesk Phone
              </label>
              <input
                type="text"
                required
                value={supportPhone}
                onChange={(e) => setSupportPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-emerald-600"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Pricing, Discounts & Shipping Rules */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-5">
          <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
            <Percent className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-black text-slate-900">Checkout &amp; Discount Configuration</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Instant UPI Prepaid Discount (₹)
              </label>
              <input
                type="number"
                required
                value={prepaidDiscount}
                onChange={(e) => setPrepaidDiscount(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black text-slate-900 focus:outline-none focus:border-emerald-600"
              />
              <p className="text-[11px] text-slate-400 mt-1 font-medium">
                Auto-applied on checkout when customer selects online payment.
              </p>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1 flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-slate-400" /> Free Shipping Threshold (₹)
              </label>
              <input
                type="number"
                required
                value={freeShippingThreshold}
                onChange={(e) => setFreeShippingThreshold(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black text-slate-900 focus:outline-none focus:border-emerald-600"
              />
              <p className="text-[11px] text-slate-400 mt-1 font-medium">
                Set to 0 for Free Courier on all orders.
              </p>
            </div>

            <div className="sm:col-span-2 flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl">
              <div>
                <p className="text-xs font-black text-slate-900">Enable Instant Prepaid Discount Banner</p>
                <p className="text-[11px] text-slate-500 font-medium">
                  Shows promotional saving highlight on Cart drawer &amp; Checkout page
                </p>
              </div>
              <input
                type="checkbox"
                checked={enablePrepaidDiscount}
                onChange={(e) => setEnablePrepaidDiscount(e.target.checked)}
                className="w-5 h-5 accent-emerald-600 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Submit Bar */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl transition shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save All Settings
          </button>
        </div>
      </form>
    </div>
  );
}