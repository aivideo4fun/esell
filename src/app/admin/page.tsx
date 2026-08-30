import Link from "next/link";
import { DollarSign, ShoppingBag, PackageCheck, AlertCircle, ArrowUpRight } from "lucide-react";

export default function AdminDashboardPage() {
  const stats = [
    { title: "Total Revenue", value: "₹48,920", change: "+14% this week", icon: DollarSign, color: "text-green-600 bg-green-50" },
    { title: "Prepaid Orders", value: "38", change: "100% verified payment", icon: ShoppingBag, color: "text-blue-600 bg-blue-50" },
    { title: "Pending Dispatch", value: "5", change: "Needs supplier fulfillment", icon: AlertCircle, color: "text-amber-600 bg-amber-50" },
    { title: "Active Catalog", value: "12 Items", change: "In 6 categories", icon: PackageCheck, color: "text-purple-600 bg-purple-50" },
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-gray-950">Store Performance</h1>
        <p className="text-sm text-gray-500 mt-1">Real-time metrics for CatchBuddy</p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500 uppercase">{stat.title}</span>
                <div className={`p-2 rounded-xl ${stat.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-black text-gray-950">{stat.value}</p>
              <p className="text-xs text-gray-500 font-medium">{stat.change}</p>
            </div>
          );
        })}
      </div>

      {/* Quick Action Hub */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4">
          <h3 className="font-bold text-gray-950 text-base">Quick Actions</h3>
          <div className="flex flex-col gap-3">
            <Link
              href="/admin/products"
              className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-2xl transition group"
            >
              <span className="text-sm font-bold text-gray-800">Add / Manage Store Products</span>
              <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition" />
            </Link>
            <Link
              href="/admin/orders"
              className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-2xl transition group"
            >
              <span className="text-sm font-bold text-gray-800">Process Pending Customer Orders</span>
              <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition" />
            </Link>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-900 to-gray-950 text-white p-6 rounded-3xl shadow-sm flex flex-col justify-between">
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider">Operational Health</span>
            <h3 className="text-lg font-bold">100% Prepaid Verification Active</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Razorpay API automatically verifies transactions before order status switches to confirmed.
            </p>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-800 text-xs text-green-400 font-bold">
            All systems normal • Database connected
          </div>
        </div>
      </div>
    </div>
  );
}
