"use client";

import { Shield } from "lucide-react";

export default function AdminRolesPage() {
  const roles = [
    { role: "SUPER_ADMIN", desc: "Unrestricted access across all commerce, finance, and system operations", users: 1 },
    { role: "FULFILLMENT_STAFF", desc: "Access limited to Orders, Tracking, and Courier Dispatch labels", users: 2 },
    { role: "CUSTOMER_SUPPORT", desc: "Read-only orders access with full access to Tickets and Refunds", users: 2 },
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
          <Shield className="w-6 h-6 text-emerald-600" /> Role-Based Access Control (RBAC)
        </h1>
        <p className="text-xs text-slate-500 font-semibold mt-0.5">
          Define access limits and feature permissions for internal personnel.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {roles.map((r, idx) => (
          <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <h3 className="font-mono font-black text-slate-900 text-xs">{r.role}</h3>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">{r.desc}</p>
            <p className="text-[11px] font-bold text-emerald-700 pt-2 border-t border-slate-100">
              {r.users} Active Users
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}