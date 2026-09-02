"use client";

import { Cpu, CheckCircle2 } from "lucide-react";

export default function AdminIntegrationsPage() {
  const integrations = [
    { name: "Razorpay Standard Checkout", type: "Payment Gateway", status: "CONNECTED" },
    { name: "Shiprocket Automated Logistics", type: "Fulfillment Engine", status: "CONNECTED" },
    { name: "WhatsApp Cloud API", type: "Transactional Notifications", status: "ACTIVE" },
    { name: "Google Analytics 4 & Meta Pixel", type: "Conversion Tracking", status: "ACTIVE" },
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
          <Cpu className="w-6 h-6 text-emerald-600" /> Third-Party Enterprise Integrations
        </h1>
        <p className="text-xs text-slate-500 font-semibold mt-0.5">
          Manage API connections for payment gateways, courier engines, and marketing webhooks.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {integrations.map((i, idx) => (
          <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-slate-900">{i.name}</h3>
              <p className="text-xs text-slate-500 font-medium">{i.type}</p>
            </div>
            <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-200">
              <CheckCircle2 className="w-3 h-3" /> {i.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}