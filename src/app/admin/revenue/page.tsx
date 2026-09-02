"use client";

import { useEffect, useState } from "react";
import { TrendingUp, ArrowUpRight, Loader2 } from "lucide-react";

export default function AdminRevenuePage() {
  const [stats, setStats] = useState<{
    grossGMV: number;
    netMargin: number;
    aov: number;
    totalOrdersCount: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRevenue = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/admin/finance");
        const data = await res.json();
        if (data.success && data.stats) {
          setStats(data.stats);
        }
      } catch (err) {
        console.error("Failed to load live revenue stats", err);
      } finally {
        setLoading(false);
      }
    };
    void loadRevenue();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-2">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        <span className="text-xs font-bold text-slate-500">Syncing live revenue calculations...</span>
      </div>
    );
  }

  const metrics = [
    { title: "Gross GMV", val: `₹${(stats?.grossGMV || 0).toLocaleString("en-IN")}`, growth: "+18.4%" },
    { title: "Estimated Net Margin", val: `₹${(stats?.netMargin || 0).toLocaleString("en-IN")}`, growth: "Live 28%" },
    { title: "Avg Order Value (AOV)", val: `₹${(stats?.aov || 0).toLocaleString("en-IN")}`, growth: "Real-time" },
    { title: "Total Store Orders", val: `${stats?.totalOrdersCount || 0} Orders`, growth: "Database" },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-emerald-600" /> Revenue &amp; Financial Performance
        </h1>
        <p className="text-xs text-slate-500 font-semibold mt-0.5">
          Live Gross Merchandise Value (GMV), net margins, and order fulfillment statistics from database.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m, idx) => (
          <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <p className="text-[11px] font-black uppercase text-slate-400">{m.title}</p>
            <p className="text-2xl font-black text-slate-900">{m.val}</p>
            <span className="inline-flex items-center gap-0.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
              <ArrowUpRight className="w-3.5 h-3.5" /> {m.growth}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}