"use client";

import { LifeBuoy, CheckCircle2, Clock, MessageSquare } from "lucide-react";
import Link from "next/link";

export default function AdminSupportDeskPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <LifeBuoy className="w-6 h-6 text-emerald-600" /> Customer Support Center
          </h1>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">
            Overview of customer ticket queues, response times, and inquiry inquiries.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <p className="text-[10px] font-black uppercase text-slate-400">Open Tickets</p>
          <p className="text-2xl font-black text-amber-600">3 Pending</p>
          <Link href="/admin/tickets/list" className="text-xs text-emerald-600 font-bold underline">
            View All Open Tickets →
          </Link>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <p className="text-[10px] font-black uppercase text-slate-400">Avg Resolution Time</p>
          <p className="text-2xl font-black text-slate-900">2.4 Hours</p>
          <p className="text-xs text-emerald-600 font-semibold">98.4% SLA adherence</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <p className="text-[10px] font-black uppercase text-slate-400">Inbound Messages</p>
          <p className="text-2xl font-black text-blue-600">12 Unread</p>
          <Link href="/admin/messages" className="text-xs text-blue-600 font-bold underline">
            Open Message Box →
          </Link>
        </div>
      </div>
    </div>
  );
}
