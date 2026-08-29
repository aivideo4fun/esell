"use client";

import { useState } from "react";
import { PackageCheck, Copy, CheckCircle, MessageSquare } from "lucide-react";

export default function AdminOrdersPage() {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [orders] = useState([
    {
      id: "CB-849201",
      customer: "Rahul Sharma",
      phone: "9876543210",
      email: "rahul@gmail.com",
      address: "B-42, Malviya Nagar, Jaipur, Rajasthan - 302017",
      item: "Smart Multi-Functional LED Desk Lamp",
      qty: 1,
      amount: 1299,
      status: "PAID_PREPAID",
      supplierStatus: "Pending Manual BaapStore Entry",
      date: "Today",
    },
    {
      id: "CB-732104",
      customer: "Pooja Verma",
      phone: "9123456780",
      email: "pooja.v@gmail.com",
      address: "Flat 301, Silver Heights, Udaipur, Rajasthan - 313001",
      item: "Car Dashboard Solar Air Freshener",
      qty: 2,
      amount: 1398,
      status: "PAID_PREPAID",
      supplierStatus: "Pending Manual BaapStore Entry",
      date: "Today",
    }
  ]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-950">CatchBuddy Order Operations</h1>
          <p className="text-sm text-gray-600">Manual fulfillment queue for BaapStore &amp; Multi-Channel Sales</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3.5 py-1.5 bg-green-100 text-green-800 text-xs font-bold rounded-full flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-600 animate-pulse" />
            Prepaid Gateway Active
          </span>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-800">
            <thead className="bg-gray-50 border-b border-gray-200 text-xs font-bold uppercase text-gray-600">
              <tr>
                <th className="p-4">Order ID</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Shipping Destination</th>
                <th className="p-4">Items &amp; Total</th>
                <th className="p-4">Fulfillment Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map((ord) => {
                const message = encodeURIComponent(
                  `🛍️ *CATCHBUDDY PREPAID ORDER*\nOrder ID: ${ord.id}\nCustomer: ${ord.customer}\nPhone: ${ord.phone}\nAddress: ${ord.address}\nItems: ${ord.item} (x${ord.qty})\nTotal: ₹${ord.amount}`
                );

                return (
                  <tr key={ord.id} className="hover:bg-gray-50/60 transition">
                    <td className="p-4 font-bold text-gray-950">
                      {ord.id}
                      <div className="text-xs font-normal text-gray-500">{ord.date}</div>
                      <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md">
                        100% PREPAID
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-gray-950">{ord.customer}</div>
                      <div className="text-xs text-gray-600">+91 {ord.phone}</div>
                    </td>
                    <td className="p-4 max-w-xs">
                      <div className="text-xs text-gray-800 font-medium leading-relaxed">{ord.address}</div>
                      <button
                        onClick={() => handleCopy(`${ord.customer}, ${ord.phone}, ${ord.address}`, ord.id)}
                        className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
                      >
                        {copiedId === ord.id ? <CheckCircle className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                        {copiedId === ord.id ? "Copied Full Address!" : "Copy Full Details"}
                      </button>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-gray-900">{ord.item} (x{ord.qty})</div>
                      <div className="text-sm font-black text-gray-950 mt-1">₹{ord.amount}</div>
                    </td>
                    <td className="p-4 space-y-2">
                      <a
                        href={`https://wa.me/91${ord.phone}?text=${message}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-xl transition"
                      >
                        <MessageSquare className="w-3.5 h-3.5" /> WhatsApp Customer
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}