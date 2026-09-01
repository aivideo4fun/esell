"use client";

import { useEffect, useState } from "react";
import {
  TrendingUp,
  Layers,
  RefreshCw,
  Loader2,
  PieChart
} from "lucide-react";

interface TopProduct {
  title: string;
  count: number;
  revenue: number;
}

interface CategoryBreakdown {
  name: string;
  value: number;
}

interface AnalyticsStats {
  totalRevenue: number;
  totalOrdersCount: number;
  paidOrdersCount: number;
  averageOrderValue: number;
  topProducts: TopProduct[];
  categoryBreakdown: CategoryBreakdown[];
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/analytics");
      const json = await res.json();
      if (json.success) {
        setData(json.stats);
      }
    } catch (err) {
      console.error("Failed to load analytics", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        <p className="text-xs font-bold text-slate-500">Compiling financial performance &amp; growth metrics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-6 px-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-950">Reports &amp; Store Analytics</h1>
          <p className="text-xs text-slate-600 font-semibold mt-1">
            Revenue tracking, product revenue leaders, category distribution, and average order value.
          </p>
        </div>
        <button
          onClick={fetchAnalytics}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 transition cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Analytics
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Gross Merchandise Value (GMV)</p>
          <p className="text-2xl font-black text-slate-900">₹{(data?.totalRevenue || 0).toLocaleString("en-IN")}</p>
          <p className="text-[10px] text-emerald-600 font-medium">All settled transactions</p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <p className="text-[11px] font-black text-emerald-600 uppercase tracking-wider">Paid Conversions</p>
          <p className="text-2xl font-black text-emerald-700">{data?.paidOrdersCount || 0}</p>
          <p className="text-[10px] text-slate-500 font-medium">Out of {data?.totalOrdersCount || 0} initiated orders</p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <p className="text-[11px] font-black text-blue-600 uppercase tracking-wider">Average Order Value (AOV)</p>
          <p className="text-2xl font-black text-blue-700">₹{(data?.averageOrderValue || 0).toLocaleString("en-IN")}</p>
          <p className="text-[10px] text-blue-600 font-medium">Mean customer cart ticket</p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <p className="text-[11px] font-black text-purple-600 uppercase tracking-wider">Catalog Revenue Drivers</p>
          <p className="text-2xl font-black text-purple-700">{data?.topProducts?.length || 0} SKUs</p>
          <p className="text-[10px] text-purple-600 font-medium">Top revenue generation</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 space-y-5 shadow-xs">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" /> Top Revenue Generating Products
            </h2>
          </div>

          {(!data?.topProducts || data.topProducts.length === 0) ? (
            <div className="py-12 text-center text-slate-400 text-xs font-bold">
              No sales data recorded yet.
            </div>
          ) : (
            <div className="space-y-3">
              {data.topProducts.map((prod, idx) => (
                <div key={idx} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="font-black text-xs text-slate-900 line-clamp-1">{prod.title}</p>
                    <p className="text-[11px] text-slate-500 font-bold">{prod.count} units sold</p>
                  </div>
                  <span className="font-black text-sm text-emerald-700 bg-white border border-slate-200 px-3 py-1 rounded-xl shadow-xs">
                    ₹{prod.revenue.toLocaleString("en-IN")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-6 space-y-5 shadow-xs">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-purple-600" /> Category Revenue Share
            </h2>
          </div>

          {(!data?.categoryBreakdown || data.categoryBreakdown.length === 0) ? (
            <div className="py-12 text-center text-slate-400 text-xs font-bold">
              No category sales recorded yet.
            </div>
          ) : (
            <div className="space-y-3">
              {data.categoryBreakdown.map((cat, idx) => (
                <div key={idx} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between">
                  <span className="font-black text-xs text-slate-900 flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5 text-slate-400" /> {cat.name}
                  </span>
                  <span className="font-black text-xs text-slate-900">
                    ₹{cat.value.toLocaleString("en-IN")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}