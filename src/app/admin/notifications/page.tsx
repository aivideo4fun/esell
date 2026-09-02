"use client";

import { useState } from "react";
import { Bell, Send, CheckCircle2 } from "lucide-react";

export default function AdminNotificationsPage() {
  const [notif, setNotif] = useState({ title: "", message: "", target: "ALL" });
  const [broadcasted, setBroadcasted] = useState(false);

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    setBroadcasted(true);
    setTimeout(() => setBroadcasted(false), 3000);
    setNotif({ title: "", message: "", target: "ALL" });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
          <Bell className="w-6 h-6 text-emerald-600" /> Admin Push Notifications Hub
        </h1>
        <p className="text-xs text-slate-500 font-semibold mt-0.5">
          Send real-time alerts directly to customer accounts and notification centers.
        </p>
      </div>

      <form onSubmit={handleBroadcast} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        {broadcasted && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Notification broadcasted successfully to all customers!
          </div>
        )}

        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">Notification Title</label>
          <input
            type="text"
            required
            placeholder="e.g. Flash Sale Live Now! Flat 20% Off"
            value={notif.title}
            onChange={(e) => setNotif({ ...notif, title: e.target.value })}
            className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">Message Description</label>
          <textarea
            required
            rows={3}
            placeholder="Write clear notification content..."
            value={notif.message}
            onChange={(e) => setNotif({ ...notif, message: e.target.value })}
            className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold outline-none focus:border-emerald-500"
          />
        </div>

        <button
          type="submit"
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer"
        >
          <Send className="w-3.5 h-3.5" /> Broadcast Push Notification
        </button>
      </form>
    </div>
  );
}