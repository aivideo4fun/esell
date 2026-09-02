"use client";

import { useState } from "react";
import { ShoppingCart, Mail, Send, Check } from "lucide-react";

export default function AdminAbandonedCartsPage() {
  const [carts, setCarts] = useState([
    {
      id: "CART-101",
      customer: "Amit Saxena",
      email: "amit.saxena@gmail.com",
      items: ["Smart ANC Earbuds Pro"],
      total: 1999,
      abandonedHours: 3,
      sentReminder: false,
    },
    {
      id: "CART-102",
      customer: "Kiran Rao",
      email: "kiran.rao@outlook.com",
      items: ["Ultra Magnetic Phone Mount", "Fast Charging Cable"],
      total: 849,
      abandonedHours: 7,
      sentReminder: true,
    },
  ]);

  const sendRecoveryEmail = (id: string) => {
    setCarts((prev) => prev.map((c) => (c.id === id ? { ...c, sentReminder: true } : c)));
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-emerald-600" /> Abandoned Carts Recovery
          </h1>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">
            Recover lost checkouts by sending automated reminder coupons and WhatsApp alerts.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-black uppercase">
            <tr>
              <th className="p-4">Customer</th>
              <th className="p-4">Cart Products</th>
              <th className="p-4">Total Cart Value</th>
              <th className="p-4">Left Unfinished</th>
              <th className="p-4 text-right">Recovery Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
            {carts.map((cart) => (
              <tr key={cart.id}>
                <td className="p-4">
                  <p className="font-black text-slate-900">{cart.customer}</p>
                  <p className="text-[11px] text-slate-400">{cart.email}</p>
                </td>
                <td className="p-4 text-slate-700 font-bold">{cart.items.join(", ")}</td>
                <td className="p-4 font-black text-slate-900">₹{cart.total}</td>
                <td className="p-4 text-slate-500">{cart.abandonedHours} hours ago</td>
                <td className="p-4 text-right">
                  <button
                    onClick={() => sendRecoveryEmail(cart.id)}
                    disabled={cart.sentReminder}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ml-auto cursor-pointer ${
                      cart.sentReminder
                        ? "bg-slate-100 text-slate-500 cursor-not-allowed"
                        : "bg-emerald-600 hover:bg-emerald-700 text-white"
                    }`}
                  >
                    {cart.sentReminder ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" /> Reminder Sent
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" /> Send 10% Off Offer
                      </>
                    )}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}