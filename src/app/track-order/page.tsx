"use client";

import { useState } from "react";
import { Search, Package, CheckCircle2, Truck, Clock } from "lucide-react";

export default function TrackOrderPage() {
  const [query, setQuery] = useState("");
  const [orderStatus, setOrderStatus] = useState<any>(null);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;

    // Mock tracking data lookup
    setOrderStatus({
      orderId: query.toUpperCase().startsWith("CB-") ? query.toUpperCase() : `CB-${query}`,
      status: "Dispatched from Hub",
      estimatedDelivery: "3 - 5 Working Days",
      courier: "Bluedart / Delhivery via BaapStore Logistics",
      steps: [
        { label: "Order Placed & Prepaid Verified", done: true, time: "Yesterday, 4:30 PM" },
        { label: "Packed & Quality Checked", done: true, time: "Today, 10:15 AM" },
        { label: "Dispatched / In Transit", done: true, time: "Today, 2:00 PM" },
        { label: "Out for Delivery", done: false, time: "Pending" },
      ],
    });
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-10">
      
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-black text-gray-950">Track Your Order</h1>
        <p className="text-sm text-gray-600">Enter your Order ID (e.g. CB-849201) or 10-digit mobile number</p>
      </div>

      {/* Search Input Box */}
      <form onSubmit={handleTrack} className="flex gap-2 bg-white p-2 rounded-2xl border border-gray-300 shadow-sm">
        <input
          required
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter Order ID or Phone..."
          className="flex-1 px-4 py-3 text-sm text-gray-950 font-medium placeholder:text-gray-400 focus:outline-none"
        />
        <button
          type="submit"
          className="px-6 py-3 bg-gray-950 hover:bg-blue-600 text-white font-bold text-sm rounded-xl transition flex items-center gap-2 cursor-pointer"
        >
          <Search className="w-4 h-4" /> Track
        </button>
      </form>

      {/* Result Status Timeline */}
      {orderStatus && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-gray-100 gap-2">
            <div>
              <span className="text-xs font-bold text-blue-600 uppercase">Order Details</span>
              <h3 className="text-lg font-black text-gray-950">{orderStatus.orderId}</h3>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-xs text-gray-500">Est. Delivery</span>
              <p className="text-sm font-bold text-green-700">{orderStatus.estimatedDelivery}</p>
            </div>
          </div>

          {/* Timeline Steps */}
          <div className="space-y-6">
            {orderStatus.steps.map((step: any, idx: number) => (
              <div key={idx} className="flex items-start gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  step.done ? "bg-green-100 text-green-700 font-bold" : "bg-gray-100 text-gray-400"
                }`}>
                  {step.done ? <CheckCircle2 className="w-5 h-5 text-green-600" /> : <Clock className="w-4 h-4" />}
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-bold ${step.done ? "text-gray-950" : "text-gray-400"}`}>
                    {step.label}
                  </p>
                  <p className="text-xs text-gray-500">{step.time}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 text-xs text-gray-600">
            <strong>Logistics:</strong> {orderStatus.courier}
          </div>
        </div>
      )}

    </div>
  );
}
