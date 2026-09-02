"use client";

import { useState } from "react";
import { Megaphone, Plus, Sparkles, CheckCircle2 } from "lucide-react";

export default function AdminCampaignsPage() {
  const [campaigns] = useState([
    {
      id: "CMP-01",
      title: "Festive Season Flash Sale",
      channel: "WhatsApp & SMS",
      audience: "All Registered Customers (1,240)",
      discountCode: "FESTIVE15",
      status: "RUNNING",
    },
    {
      id: "CMP-02",
      title: "Instant ₹50 Prepaid Promo",
      channel: "Storefront Banner & Push",
      audience: "New Visitors",
      discountCode: "PREPAID50",
      status: "ACTIVE",
    },
  ]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-emerald-600" /> Marketing &amp; Promotional Campaigns
          </h1>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">
            Create broadcast promotions, flash sale deals, and coupon boosts.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {campaigns.map((cmp) => (
          <div key={cmp.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-mono font-bold text-slate-400">{cmp.id}</span>
                <h3 className="text-sm font-black text-slate-900">{cmp.title}</h3>
                <p className="text-xs text-slate-500 font-medium">{cmp.channel}</p>
              </div>
              <span className="text-[10px] font-black uppercase bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full border border-emerald-200">
                {cmp.status}
              </span>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-600">Target: {cmp.audience}</span>
              <span className="font-mono font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                {cmp.discountCode}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}