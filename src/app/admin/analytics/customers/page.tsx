"use client";

import { Users, UserCheck, TrendingUp, ShoppingBag } from "lucide-react";

export default function AdminCustomerAnalyticsPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
          <Users className="w-6 h-6 text-emerald-600" /> Customer Retention &amp; Cohort Analytics
        </h1>
        <p className="text-xs text-slate-500 font-semibold mt-0.5">
          Monitor repeat purchase behavior, customer acquisition cost (CAC), and customer lifetime value (LTV).
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <p className="text-[10px] font-black uppercase text-slate-400">Customer Lifetime Value (LTV)</p>
          <p className="text-2xl font-black text-slate-900">₹3,480</p>
          <p className="text-xs text-emerald-600 font-semibold">Average 2.8 orders per buyer</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <p className="text-[10px] font-black uppercase text-slate-400">Repeat Customer Rate</p>
          <p className="text-2xl font-black text-slate-900">31.4%</p>
          <p className="text-xs text-slate-500 font-medium">+5% growth from discount coupons</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <p className="text-[10px] font-black uppercase text-slate-400">Prepaid Adoption</p>
          <p className="text-2xl font-black text-emerald-700">82.6%</p>
          <p className="text-xs text-emerald-600 font-semibold">Zero RTO risk on prepaid</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-black text-slate-900">Customer Segment Breakdown</h3>
        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
            <span className="font-bold text-slate-700">First-Time Shoppers</span>
            <span className="font-black text-slate-900">68.6%</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
            <span className="font-bold text-slate-700">High-Value Repeat VIPs (&gt; ₹5,000 spend)</span>
            <span className="font-black text-emerald-700">18.2%</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
            <span className="font-bold text-slate-700">Cart Drop-off Leads</span>
            <span className="font-black text-amber-700">13.2%</span>
          </div>
        </div>
      </div>
    </div>
  );
}