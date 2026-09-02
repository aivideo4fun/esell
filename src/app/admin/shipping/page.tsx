"use client";

import { useState } from "react";
import { Truck, ShieldCheck, Check, Settings2 } from "lucide-react";

export default function AdminShippingPage() {
  const [couriers, setCouriers] = useState([
    { name: "BlueDart Express", status: "Connected", code: "BLUEDART", active: true },
    { name: "Delhivery Surface & Air", status: "Connected", code: "DELHIVERY", active: true },
    { name: "DTDC Express", status: "Available", code: "DTDC", active: false },
    { name: "Shiprocket API Engine", status: "Configured", code: "SHIPROCKET", active: true },
  ]);

  const [settings, setSettings] = useState({
    freeShippingThreshold: "999",
    standardShippingFee: "49",
    codAvailable: true,
    instantPrepaidDiscount: "50",
  });

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
          <Truck className="w-6 h-6 text-emerald-600" /> Shipping &amp; Logistics Control
        </h1>
        <p className="text-xs text-slate-500 font-semibold mt-0.5">
          Configure Courier integrations, dispatch rate limits, and shipping thresholds.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
            <Settings2 className="w-4 h-4 text-emerald-600" /> Checkout Shipping Rules
          </h2>

          <div className="space-y-3 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Free Delivery Min Order Value (₹)</label>
              <input
                type="number"
                value={settings.freeShippingThreshold}
                onChange={(e) => setSettings({ ...settings, freeShippingThreshold: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 font-semibold outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Standard Delivery Fee (₹)</label>
              <input
                type="number"
                value={settings.standardShippingFee}
                onChange={(e) => setSettings({ ...settings, standardShippingFee: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 font-semibold outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Prepaid Instant Discount (₹)</label>
              <input
                type="number"
                value={settings.instantPrepaidDiscount}
                onChange={(e) => setSettings({ ...settings, instantPrepaidDiscount: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 font-semibold outline-none"
              />
            </div>

            <button
              onClick={() => alert("Shipping parameters saved successfully!")}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition cursor-pointer"
            >
              Update Shipping Rules
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-600" /> Integrated Logistics Gateways
          </h2>

          <div className="space-y-3">
            {couriers.map((c, idx) => (
              <div key={idx} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between">
                <div>
                  <p className="text-xs font-black text-slate-900">{c.name}</p>
                  <p className="text-[10px] text-slate-500 font-semibold">{c.status}</p>
                </div>
                <span className={`text-[10px] font-black px-2.5 py-1 rounded-md ${
                  c.active ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600"
                }`}>
                  {c.active ? "ACTIVE" : "STANDBY"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}