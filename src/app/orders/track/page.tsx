"use client";

import { useState } from "react";
import { Truck, Search, CheckCircle2, Clock } from "lucide-react";

interface TrackingStep {
  title: string;
  desc: string;
  completed: boolean;
}

interface TrackingDetails {
  orderId: string;
  carrier: string;
  awb: string;
  estimatedDelivery: string;
  steps: TrackingStep[];
}

export default function TrackOrderPage() {
  const [orderQuery, setOrderQuery] = useState("");
  const [trackingData, setTrackingData] = useState<TrackingDetails | null>(null);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderQuery) return;

    setTrackingData({
      orderId: orderQuery.toUpperCase(),
      carrier: "BlueDart Express",
      awb: "BD982736192IN",
      estimatedDelivery: "2-3 Business Days",
      steps: [
        { title: "Order Confirmed", desc: "Payment received & verified", completed: true },
        { title: "Processing & Packed", desc: "Item packed at CatchBuddy warehouse", completed: true },
        { title: "Handed to Courier", desc: "Out for hub transit", completed: false },
        { title: "Out for Delivery", desc: "Delivery partner assigned", completed: false },
      ],
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
            <Truck className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-slate-950">Track Shipment</h1>
          <p className="text-xs text-slate-500">
            Enter your CatchBuddy Order ID or AWB Tracking Number.
          </p>
        </div>

        <form onSubmit={handleTrack} className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-2">
          <input
            type="text"
            required
            placeholder="e.g. CB-892182"
            value={orderQuery}
            onChange={(e) => setOrderQuery(e.target.value)}
            className="w-full bg-transparent px-3 text-xs font-semibold text-slate-900 outline-none placeholder:text-slate-400"
          />
          <button
            type="submit"
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <Search className="w-3.5 h-3.5" /> Track
          </button>
        </form>

        {trackingData && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
            <div className="flex flex-wrap justify-between items-center gap-4 border-b border-slate-100 pb-4">
              <div>
                <p className="text-[10px] font-bold uppercase text-slate-400">Order Ref</p>
                <p className="text-sm font-black text-slate-900">#{trackingData.orderId}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase text-slate-400">Carrier</p>
                <p className="text-xs font-bold text-slate-700">{trackingData.carrier} ({trackingData.awb})</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase text-slate-400">Est. Arrival</p>
                <p className="text-xs font-black text-emerald-600">{trackingData.estimatedDelivery}</p>
              </div>
            </div>

            <div className="space-y-6 relative pl-6 border-l-2 border-slate-100 ml-4">
              {trackingData.steps.map((step, idx) => (
                <div key={idx} className="relative">
                  <div
                    className={`absolute -left-7.75 top-0 w-6 h-6 rounded-full border-2 flex items-center justify-center bg-white ${
                      step.completed
                        ? "border-emerald-600 text-emerald-600"
                        : "border-slate-300 text-slate-400"
                    }`}
                  >
                    {step.completed ? <CheckCircle2 className="w-4 h-4 fill-emerald-600 text-white" /> : <Clock className="w-3 h-3" />}
                  </div>
                  <div>
                    <p className={`text-xs font-bold ${step.completed ? "text-slate-900" : "text-slate-500"}`}>
                      {step.title}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}