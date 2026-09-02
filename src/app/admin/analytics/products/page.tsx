"use client";

import { useEffect, useState } from "react";
import { BarChart3, Loader2, Package } from "lucide-react";

interface TopProduct {
  title: string;
  count: number;
  revenue: number;
}

export default function AdminProductAnalyticsPage() {
  const [products, setProducts] = useState<TopProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/admin/analytics");
        const data = await res.json();
        if (data.success && data.stats?.topProducts) {
          setProducts(data.stats.topProducts);
        }
      } catch (err) {
        console.error("Failed to load product analytics", err);
      } finally {
        setLoading(false);
      }
    };
    void loadAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-2">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        <span className="text-xs font-bold text-slate-500">Calculating SKU conversions...</span>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-emerald-600" /> Product Performance Analytics
        </h1>
        <p className="text-xs text-slate-500 font-semibold mt-0.5">
          Live SKU sales performance and gross revenues calculated directly from customer orders.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-x-auto">
        {products.length === 0 ? (
          <div className="py-16 text-center text-slate-500 space-y-2">
            <Package className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs font-black text-slate-800">No product sales recorded yet</p>
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-black uppercase">
              <tr>
                <th className="p-4">Catalog Item</th>
                <th className="p-4">Units Sold</th>
                <th className="p-4 text-right">Gross Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {products.map((p, idx) => (
                <tr key={idx} className="hover:bg-slate-50/60 transition">
                  <td className="p-4 font-bold text-slate-900">{p.title}</td>
                  <td className="p-4 font-semibold text-slate-700">{p.count} Units</td>
                  <td className="p-4 text-right font-black text-emerald-700">₹{p.revenue.toLocaleString("en-IN")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}