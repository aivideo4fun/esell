"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Bell, 
  ArrowLeft, 
  Package, 
  Sparkles, 
  Clock, 
  Loader2,
  CheckCheck
} from "lucide-react";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  createdAt: string;
  read: boolean;
}

export default function CustomerNotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/customer/notifications");
        const data = await res.json();
        if (data.success) {
          setNotifications(data.notifications || []);
        }
      } catch (err) {
        console.error("Failed to load notifications", err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/account"
              className="p-2 bg-white hover:bg-slate-100 rounded-xl border border-slate-200 transition text-slate-700"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <Bell className="w-5 h-5 text-emerald-600" /> Notifications
              </h1>
              <p className="text-xs text-slate-500">Order updates, shipping alerts, and exclusive offers.</p>
            </div>
          </div>

          {notifications.some((n) => !n.read) && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold transition shadow-2xs cursor-pointer"
            >
              <CheckCheck className="w-3.5 h-3.5 text-emerald-600" /> Mark all as read
            </button>
          )}
        </div>

        {/* Notifications List */}
        {loading ? (
          <div className="min-h-[50vh] flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
            <span className="text-xs font-bold text-slate-500">Checking your alerts...</span>
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3 shadow-xs">
            <Bell className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-base font-black text-slate-800">No New Notifications</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              You are all caught up! Order alerts and delivery updates will show up here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((item) => (
              <div
                key={item.id}
                className={`bg-white rounded-2xl border p-4 shadow-2xs flex items-start gap-3.5 transition ${
                  item.read ? "border-slate-200 opacity-80" : "border-emerald-200 ring-1 ring-emerald-500/10"
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    item.type === "ORDER"
                      ? "bg-blue-50 text-blue-600"
                      : "bg-emerald-50 text-emerald-600"
                  }`}
                >
                  {item.type === "ORDER" ? (
                    <Package className="w-4 h-4" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-bold text-slate-900 truncate">{item.title}</p>
                    <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1 shrink-0">
                      <Clock className="w-3 h-3" />
                      {new Date(item.createdAt).toLocaleDateString("en-IN")}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 font-medium mt-1 leading-relaxed">
                    {item.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}