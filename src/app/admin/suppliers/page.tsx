"use client";

import { useState } from "react";
import { Truck, Plus, Mail, Phone, MapPin, Building2, CheckCircle2 } from "lucide-react";

interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  category: string;
  status: "ACTIVE" | "PENDING";
  leadTime: string;
}

export default function AdminSuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([
    {
      id: "SUP-01",
      name: "Apex Gadgets Logistics",
      contactPerson: "Rahul Verma",
      email: "rahul@apexgadgets.in",
      phone: "+91 98112 34567",
      category: "Electronics & Smart Devices",
      status: "ACTIVE",
      leadTime: "2-3 Days",
    },
    {
      id: "SUP-02",
      name: "Zenith Home Crafts",
      contactPerson: "Pooja Sharma",
      email: "pooja@zenithcrafts.com",
      phone: "+91 98710 88219",
      category: "Home & Lifestyle",
      status: "ACTIVE",
      leadTime: "4-5 Days",
    },
  ]);

  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    contactPerson: "",
    email: "",
    phone: "",
    category: "Electronics",
    leadTime: "3 Days",
  });

  const handleAddSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    const newEntry: Supplier = {
      id: `SUP-0${suppliers.length + 1}`,
      name: formData.name,
      contactPerson: formData.contactPerson,
      email: formData.email,
      phone: formData.phone,
      category: formData.category,
      status: "ACTIVE",
      leadTime: formData.leadTime,
    };
    setSuppliers([...suppliers, newEntry]);
    setShowAdd(false);
    setFormData({ name: "", contactPerson: "", email: "", phone: "", category: "Electronics", leadTime: "3 Days" });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-emerald-600" /> Supplier &amp; Vendor Management
          </h1>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">
            Manage procurement partners, stock lead times, and fulfillment vendors.
          </p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs"
        >
          <Plus className="w-4 h-4" /> Add Vendor
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleAddSupplier} className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-sm space-y-4">
          <h3 className="text-sm font-black text-slate-900">Add New Procurement Vendor</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              required
              placeholder="Vendor / Company Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:border-emerald-500"
            />
            <input
              type="text"
              required
              placeholder="Contact Person"
              value={formData.contactPerson}
              onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
              className="border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:border-emerald-500"
            />
            <input
              type="email"
              required
              placeholder="Vendor Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:border-emerald-500"
            />
            <input
              type="tel"
              required
              placeholder="Phone Number"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:border-emerald-500"
            />
            <input
              type="text"
              placeholder="Category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:border-emerald-500"
            />
            <input
              type="text"
              placeholder="Average Lead Time (e.g. 3 Days)"
              value={formData.leadTime}
              onChange={(e) => setFormData({ ...formData, leadTime: e.target.value })}
              className="border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:border-emerald-500"
            />
          </div>
          <button type="submit" className="px-5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold cursor-pointer">
            Save Vendor Profile
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {suppliers.map((sup) => (
          <div key={sup.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-mono font-bold text-slate-400">{sup.id}</span>
                <h3 className="text-sm font-black text-slate-900">{sup.name}</h3>
                <p className="text-xs text-slate-500 font-medium">{sup.category}</p>
              </div>
              <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full border border-emerald-200">
                <CheckCircle2 className="w-3 h-3" /> {sup.status}
              </span>
            </div>

            <div className="pt-2 border-t border-slate-100 text-xs space-y-1.5 text-slate-600 font-semibold">
              <p className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-400" /> {sup.email}
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-400" /> {sup.phone} ({sup.contactPerson})
              </p>
              <p className="flex items-center gap-2 text-slate-900 font-black">
                <Truck className="w-3.5 h-3.5 text-emerald-600" /> Lead Time: {sup.leadTime}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}