"use client";

import { useState, useEffect } from "react";
import { Bell, Loader2, CheckCircle2, Send } from "lucide-react";

export default function AdminNotificationsPage() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);
  const [sentHistory, setSentHistory] = useState<any[]>([]);

  // Fetch previously broadcasted notifications
  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/admin/notifications", { cache: "no-store" });
      const data = await res.json();
      if (data.success) {
        setSentHistory(data.notifications || []);
      }
    } catch (err) {
      console.error("Failed to fetch notification history", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      alert("Kripya Title aur Message dono enter karein.");
      return;
    }

    setLoading(true);
    setSuccessMsg(false);

    try {
      const res = await fetch("/api/admin/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, message }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMsg(true);
        setTitle("");
        setMessage("");
        fetchNotifications();
        setTimeout(() => setSuccessMsg(false), 4000);
      } else {
        alert(data.error || "Failed to broadcast notification");
      }
    } catch (err) {
      console.error("Broadcast error:", err);
      alert("Network error while broadcasting notification");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 sm:p-10 max-w-5xl mx-auto font-sans text-slate-900 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black">
          <Bell className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">Admin Push Notifications Hub</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Send real-time alerts directly to all customer accounts and notification centers.
          </p>
        </div>
      </div>

      {/* Broadcast Form */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5">
        <form onSubmit={handleBroadcast} className="space-y-4 max-w-2xl">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">Notification Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Flash Sale Live Now! Flat 20% Off"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-slate-200 bg-white rounded-2xl px-4 py-3 text-xs font-bold text-slate-900 outline-none focus:border-emerald-500 transition shadow-2xs"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">Message Description</label>
            <textarea
              required
              rows={4}
              placeholder="Write clear notification content..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full border border-slate-200 bg-white rounded-2xl p-4 text-xs font-medium text-slate-900 outline-none focus:border-emerald-500 transition shadow-2xs"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-black transition flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Broadcast Push Notification
            </button>
            {successMsg && (
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 animate-fade-in">
                <CheckCircle2 className="w-4 h-4" /> Broadcasted successfully to all users!
              </span>
            )}
          </div>
        </form>
      </div>

      {/* History of Sent Notifications */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
        <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
          Broadcast History ({sentHistory.length})
        </h3>

        {sentHistory.length === 0 ? (
          <p className="text-xs text-slate-400 py-4">No broadcast alerts sent yet.</p>
        ) : (
          <div className="space-y-3">
            {sentHistory.map((item) => (
              <div key={item.id} className="p-4 border border-slate-100 rounded-2xl bg-slate-50/60 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                    📢 {item.title}
                  </h4>
                  <p className="text-xs text-slate-600 font-medium">{item.message}</p>
                </div>
                <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap">
                  {new Date(item.createdAt).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}