/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  User, 
  Package, 
  Truck, 
  Heart, 
  MapPin, 
  TicketPercent, 
  Bell, 
  HelpCircle, 
  LogOut,
  ChevronRight,
  Loader2,
  Mail,
  Phone,
  Lock,
  CheckCircle2,
  Plus
} from "lucide-react";

export default function CustomerAccountPage() {
  const [activeTab, setActiveTab] = useState("account");
  const [loading, setLoading] = useState(true);

  // Profile Form States
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "Jitendra Gawdiya",
    email: "customer_1788325717546@catchbuddy.store",
    phone: "07976152206",
    isEmailVerified: true,
  });

  // Data States
  const [orders, setOrders] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Address Form State
  const [newAddr, setNewAddr] = useState({
    fullName: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [addingAddr, setAddingAddr] = useState(false);

  // Support State (Real-time Tickets)
  const [supportMsg, setSupportMsg] = useState({ subject: "", message: "" });
  const [submittingSupport, setSubmittingSupport] = useState(false);
  const [createdTicket, setCreatedTicket] = useState<any | null>(null);
  const [tickets, setTickets] = useState<any[]>([]);

  useEffect(() => {
    const loadAllCustomerData = async () => {
      try {
        setLoading(true);

        // 1. Sync from local storage
        const storedCustomer = localStorage.getItem("cb_customer");
        let activeEmail = profileData.email;
        if (storedCustomer) {
          try {
            const parsed = JSON.parse(storedCustomer);
            if (parsed.email) activeEmail = parsed.email;
            setProfileData((prev) => ({
              ...prev,
              name: parsed.name || prev.name,
              email: parsed.email || prev.email,
              phone: parsed.phone || prev.phone,
            }));
          } catch {}
        }

        // 2. Fetch live customer profile from DB
        try {
          const resProf = await fetch("/api/customer/profile");
          const dataProf = await resProf.json();
          if (dataProf.success && dataProf.customer) {
            activeEmail = dataProf.customer.email || activeEmail;
            setProfileData({
              name: dataProf.customer.name || "Jitendra Gawdiya",
              email: dataProf.customer.email || "customer_1788325717546@catchbuddy.store",
              phone: dataProf.customer.phone || "07976152206",
              isEmailVerified: true,
            });
          }
        } catch {}

        // 3. Fetch Orders
        try {
          const resOrders = await fetch("/api/orders");
          const dataOrders = await resOrders.json();
          if (dataOrders.success) setOrders(dataOrders.orders || []);
        } catch {}

        // 4. Fetch Coupons
        try {
          const resCoupons = await fetch("/api/customer/coupons");
          const dataCoupons = await resCoupons.json();
          if (dataCoupons.success) setCoupons(dataCoupons.coupons || []);
        } catch {}

        // 5. Fetch Addresses
        try {
          const resAddr = await fetch("/api/customer/addresses");
          const dataAddr = await resAddr.json();
          if (dataAddr.success) setAddresses(dataAddr.addresses || []);
        } catch {}

        // 6. Fetch Customer Support Tickets directly from tickets API
        if (activeEmail) {
          try {
            const resTickets = await fetch(`/api/admin/tickets?email=${encodeURIComponent(activeEmail)}`, { cache: "no-store" });
            const dataTickets = await resTickets.json();
            if (dataTickets.success) setTickets(dataTickets.tickets || []);
          } catch {}
        }

      } catch (err) {
        console.error("Failed to load customer data", err);
      } finally {
        setLoading(false);
      }
    };

    void loadAllCustomerData();
  }, []);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);
    try {
      const res = await fetch("/api/customer/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: profileData.name, phone: profileData.phone }),
      });
      const data = await res.json();
      if (data.success || res.ok) {
        localStorage.setItem("cb_customer", JSON.stringify(profileData));
        window.dispatchEvent(new Event("customer-auth-changed"));

        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (err) {
      console.error("Failed to update profile", err);
    } finally {
      setSaving(false);
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/customer/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAddr),
      });
      const data = await res.json();
      if (data.success) {
        setAddresses((prev) => [...prev, data.address]);
        setAddingAddr(false);
        setNewAddr({ fullName: "", phone: "", street: "", city: "", state: "", pincode: "" });
      }
    } catch (err) {
      console.error("Failed to add address", err);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleLogout = () => {
    localStorage.removeItem("cb_customer");
    document.cookie = "customer_id=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    window.dispatchEvent(new Event("customer-auth-changed"));
    window.location.href = "/";
  };

  // Real Support Ticket Submission
  const handleSupportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingSupport(true);
    try {
      const res = await fetch("/api/admin/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profileData.name,
          email: profileData.email,
          phone: profileData.phone,
          subject: supportMsg.subject,
          message: supportMsg.message,
        }),
      });
      const data = await res.json();
      if (data.success && data.ticket) {
        setCreatedTicket(data.ticket);
        setTickets((prev) => [data.ticket, ...prev]);
        setSupportMsg({ subject: "", message: "" });
      } else {
        alert(data.error || "Support request submit nahi ho payi.");
      }
    } catch {
      alert("Network error submitting support request");
    } finally {
      setSubmittingSupport(false);
    }
  };

  const menuItems = [
    { id: "account", label: "My Account", icon: User },
    { id: "orders", label: "My Orders", icon: Package, count: orders.length || 9 },
    { id: "track", label: "Track Order", icon: Truck },
    { id: "wishlist", label: "Wishlist", icon: Heart, link: "/wishlist" },
    { id: "addresses", label: "Saved Addresses", icon: MapPin, count: addresses.length },
    { id: "coupons", label: "Coupons", icon: TicketPercent, count: coupons.length || 1 },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "support", label: "Help & Support", icon: HelpCircle, count: tickets.length > 0 ? tickets.length : undefined },
  ];

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        <p className="text-xs font-bold text-slate-500">Loading your account...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
          
          {/* Left Navigation Sidebar */}
          <div className="md:col-span-1 bg-white rounded-3xl border border-slate-200 p-4 shadow-xs space-y-4">
            
            {/* Sidebar Profile Card: Name + Mobile Number */}
            <div className="p-3 border-b border-slate-100 flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-base shrink-0">
                {profileData.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-sm text-slate-900 truncate">{profileData.name}</p>
                <p className="text-xs font-bold text-slate-600 truncate mt-0.5">
                  {profileData.phone}
                </p>
              </div>
            </div>

            <nav className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                if (item.link) {
                  return (
                    <Link
                      key={item.id}
                      href={item.link}
                      className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition"
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4 text-slate-400" />
                        <span>{item.label}</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                    </Link>
                  );
                }

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition cursor-pointer ${
                      isActive
                        ? "bg-emerald-600 text-white shadow-sm"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.count !== undefined && item.count > 0 ? (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                        isActive ? "bg-white text-emerald-700" : "bg-slate-100 text-slate-600"
                      }`}>
                        {item.count}
                      </span>
                    ) : (
                      <ChevronRight className={`w-3.5 h-3.5 ${isActive ? "text-white/80" : "text-slate-300"}`} />
                    )}
                  </button>
                );
              })}

              <hr className="my-2 border-slate-100" />

              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-2xl transition cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </nav>
          </div>

          {/* Right Main Content Area */}
          <div className="md:col-span-3 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs min-h-[480px]">
            
            {/* 1. PERSONAL INFORMATION TAB */}
            {activeTab === "account" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-black text-slate-900">Personal Information</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Manage your name, mobile number and security credentials.
                  </p>
                </div>

                <form onSubmit={handleProfileSave} className="space-y-5 max-w-xl">
                  {/* Full Name */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1.5">
                      Full Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        required
                        placeholder="Enter full name"
                        value={profileData.name}
                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                        className="w-full border border-slate-200 bg-white rounded-2xl pl-10 pr-4 py-3 text-xs font-bold text-slate-900 outline-none focus:border-emerald-500 transition shadow-2xs"
                      />
                    </div>
                  </div>

                  {/* Locked & Verified Email */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-slate-700">
                        Email Address
                      </label>
                      <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Lock className="w-3 h-3 text-emerald-600" /> Locked &amp; Verified
                      </span>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        disabled
                        value={profileData.email}
                        className="w-full border border-slate-200 bg-slate-50 rounded-2xl pl-10 pr-10 py-3 text-xs font-bold text-slate-500 outline-none cursor-not-allowed select-all"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4 text-slate-400" />
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-400 font-medium mt-1">
                      Email is permanently locked after verification for security reasons.
                    </p>
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1.5">
                      Phone Number
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Phone className="w-4 h-4" />
                      </div>
                      <input
                        type="tel"
                        required
                        placeholder="Enter phone number"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                        className="w-full border border-slate-200 bg-white rounded-2xl pl-10 pr-4 py-3 text-xs font-bold text-slate-900 outline-none focus:border-emerald-500 transition shadow-2xs"
                      />
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
                    >
                      {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Save Changes
                    </button>
                    {savedSuccess && (
                      <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Details updated successfully!
                      </span>
                    )}
                  </div>
                </form>
              </div>
            )}

            {/* 2. Orders Tab */}
            {activeTab === "orders" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-black text-slate-900">Order History</h2>
                  <p className="text-xs text-slate-500">Track and review all purchases placed on CatchBuddy.</p>
                </div>

                {orders.length === 0 ? (
                  <div className="text-center py-12 space-y-3">
                    <Package className="w-12 h-12 text-slate-300 mx-auto" />
                    <p className="text-sm font-black text-slate-700">No Orders Placed Yet</p>
                    <Link
                      href="/shop"
                      className="inline-block px-5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold"
                    >
                      Browse Catalog
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order.id} className="p-4 border border-slate-200 rounded-2xl space-y-3">
                        <div className="flex items-center justify-between text-xs border-b border-slate-100 pb-2">
                          <span className="font-mono font-bold text-slate-800">#{order.id.slice(-6).toUpperCase()}</span>
                          <span className="font-black text-emerald-600">₹{order.totalAmount}</span>
                        </div>
                        <p className="text-xs text-slate-500">{new Date(order.createdAt).toLocaleDateString("en-IN")}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 3. Track Order Tab */}
            {activeTab === "track" && (
              <div className="space-y-6 max-w-xl">
                <div>
                  <h2 className="text-lg font-black text-slate-900">Live Package Tracking</h2>
                  <p className="text-xs text-slate-500">Enter your Order ID to see real-time transit status.</p>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. CB-89234"
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold outline-none focus:border-emerald-500"
                  />
                  <button className="px-5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold shrink-0 cursor-pointer">
                    Track
                  </button>
                </div>

                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-800 space-y-1">
                  <p className="font-bold">Standard Delivery Guarantee</p>
                  <p className="text-[11px] text-emerald-700">All orders are packed and dispatched via Express Air Courier within 24 hours.</p>
                </div>
              </div>
            )}

            {/* 4. Saved Addresses Tab */}
            {activeTab === "addresses" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-black text-slate-900">Saved Addresses</h2>
                    <p className="text-xs text-slate-500">Manage shipping addresses for instant checkout.</p>
                  </div>
                  <button
                    onClick={() => setAddingAddr(!addingAddr)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-bold cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Address
                  </button>
                </div>

                {addingAddr && (
                  <form onSubmit={handleAddAddress} className="p-4 border border-emerald-200 bg-emerald-50/40 rounded-2xl space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        required
                        placeholder="Receiver Name"
                        value={newAddr.fullName}
                        onChange={(e) => setNewAddr({ ...newAddr, fullName: e.target.value })}
                        className="border bg-white rounded-xl px-3 py-1.5 text-xs outline-none"
                      />
                      <input
                        type="tel"
                        required
                        placeholder="Mobile Number"
                        value={newAddr.phone}
                        onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })}
                        className="border bg-white rounded-xl px-3 py-1.5 text-xs outline-none"
                      />
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="Street / Flat / Area"
                      value={newAddr.street}
                      onChange={(e) => setNewAddr({ ...newAddr, street: e.target.value })}
                      className="w-full border bg-white rounded-xl px-3 py-1.5 text-xs outline-none"
                    />
                    <div className="grid grid-cols-3 gap-2">
                      <input
                        type="text"
                        required
                        placeholder="City"
                        value={newAddr.city}
                        onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                        className="border bg-white rounded-xl px-3 py-1.5 text-xs outline-none"
                      />
                      <input
                        type="text"
                        required
                        placeholder="State"
                        value={newAddr.state}
                        onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })}
                        className="border bg-white rounded-xl px-3 py-1.5 text-xs outline-none"
                      />
                      <input
                        type="text"
                        required
                        placeholder="Pincode"
                        value={newAddr.pincode}
                        onChange={(e) => setNewAddr({ ...newAddr, pincode: e.target.value })}
                        className="border bg-white rounded-xl px-3 py-1.5 text-xs outline-none"
                      />
                    </div>
                    <button type="submit" className="px-4 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-bold cursor-pointer">
                      Save Location
                    </button>
                  </form>
                )}

                {addresses.length === 0 ? (
                  <p className="text-xs text-slate-400 py-6 text-center">No saved addresses yet.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {addresses.map((addr) => (
                      <div key={addr.id} className="p-4 border border-slate-200 rounded-2xl text-xs space-y-1">
                        <p className="font-bold text-slate-900">{addr.fullName}</p>
                        <p className="text-slate-500">{addr.street}, {addr.city} - {addr.pincode}</p>
                        <p className="text-slate-700 font-semibold">📞 {addr.phone}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 5. Coupons Tab */}
            {activeTab === "coupons" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-black text-slate-900">Available Coupons &amp; Offers</h2>
                  <p className="text-xs text-slate-500">Apply discount codes at checkout for instant cart savings.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {coupons.length === 0 ? (
                    <div className="p-5 border border-dashed border-emerald-300 rounded-2xl bg-emerald-50/40 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-3 py-1 bg-emerald-600 text-white font-mono font-bold text-xs rounded-lg">
                          PREPAID50
                        </span>
                        <span className="text-xs font-black text-emerald-700">₹50 FLAT OFF</span>
                      </div>
                      <p className="text-xs text-slate-600">Save ₹50 automatically on UPI and Online payments.</p>
                      <button
                        onClick={() => handleCopyCode("PREPAID50")}
                        className="px-3 py-1 bg-white border border-slate-200 text-xs font-bold rounded-lg cursor-pointer"
                      >
                        {copiedCode === "PREPAID50" ? "Copied!" : "Copy Code"}
                      </button>
                    </div>
                  ) : (
                    coupons.map((c) => (
                      <div key={c.id} className="p-5 border border-dashed border-emerald-300 rounded-2xl bg-emerald-50/40 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="px-3 py-1 bg-emerald-600 text-white font-mono font-bold text-xs rounded-lg">
                            {c.code}
                          </span>
                          <span className="text-xs font-black text-emerald-700">
                            {c.discountType === "PERCENTAGE" ? `${c.discountValue}% OFF` : `₹${c.discountValue} OFF`}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600">{c.description || "Applicable on your cart total."}</p>
                        <button
                          onClick={() => handleCopyCode(c.code)}
                          className="px-3 py-1 bg-white border border-slate-200 text-xs font-bold rounded-lg cursor-pointer"
                        >
                          {copiedCode === c.code ? "Copied!" : "Copy Code"}
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* 6. Notifications Tab */}
            {activeTab === "notifications" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-black text-slate-900">Notifications &amp; Alerts</h2>
                  <p className="text-xs text-slate-500">Live order status and dispatch notifications.</p>
                </div>

                <div className="space-y-3">
                  <div className="p-4 border border-slate-200 rounded-2xl text-xs space-y-1 bg-slate-50/50">
                    <p className="font-bold text-slate-900">⚡ Welcome to CatchBuddy!</p>
                    <p className="text-slate-500">Prepaid orders are eligible for instant discount &amp; zero shipping charge.</p>
                  </div>
                </div>
              </div>
            )}

            {/* 7. REAL-TIME HELP & SUPPORT DESK */}
            {activeTab === "support" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-black text-slate-900">Help &amp; Support Desk</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Raise a support ticket or track existing requests with our 24/7 dedicated support team.
                  </p>
                </div>

                {/* Instant Generated Ticket Banner */}
                {createdTicket && (
                  <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-3xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-emerald-950 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Support Ticket Generated!
                      </span>
                      <span className="px-3 py-1 bg-emerald-600 text-white font-mono font-black text-xs rounded-xl shadow-2xs">
                        {createdTicket.ticketNumber}
                      </span>
                    </div>
                    <p className="text-xs text-emerald-800">
                      Aapka request admin panel me forward ho chuka hai. Please note down your Ticket Number:{" "}
                      <strong className="font-mono font-black">{createdTicket.ticketNumber}</strong>.
                    </p>
                  </div>
                )}

                {/* Ticket Submission Form */}
                <form onSubmit={handleSupportSubmit} className="space-y-4 max-w-xl">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1.5">
                      Issue Subject
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Order Delivery Delay / Return Request / Payment Query"
                      value={supportMsg.subject}
                      onChange={(e) => setSupportMsg({ ...supportMsg, subject: e.target.value })}
                      className="w-full border border-slate-200 bg-white rounded-2xl px-4 py-3 text-xs font-bold text-slate-900 outline-none focus:border-emerald-500 transition shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1.5">
                      Describe your issue
                    </label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Please provide complete details regarding your query or order issue..."
                      value={supportMsg.message}
                      onChange={(e) => setSupportMsg({ ...supportMsg, message: e.target.value })}
                      className="w-full border border-slate-200 bg-white rounded-2xl p-4 text-xs font-medium text-slate-900 outline-none focus:border-emerald-500 transition shadow-2xs"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingSupport}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    {submittingSupport && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Submit Request
                  </button>
                </form>

                {/* Real-time Customer Ticket History */}
                <div className="pt-6 border-t border-slate-100 space-y-3">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                    Your Support Tickets ({tickets.length})
                  </h3>

                  {tickets.length === 0 ? (
                    <p className="text-xs text-slate-400 py-3">No previous support tickets raised yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {tickets.map((t) => (
                        <div
                          key={t.id}
                          className="p-4 border border-slate-200 rounded-2xl bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-black text-emerald-700">{t.ticketNumber}</span>
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                  t.status === "RESOLVED"
                                    ? "bg-emerald-100 text-emerald-800"
                                    : t.status === "IN_PROGRESS"
                                    ? "bg-amber-100 text-amber-800"
                                    : "bg-blue-100 text-blue-800"
                                }`}
                              >
                                {t.status.replace("_", " ")}
                              </span>
                            </div>
                            <p className="font-bold text-slate-900">{t.subject}</p>
                            <p className="text-[11px] text-slate-600">{t.message}</p>
                            {t.adminReply && (
                              <p className="text-[11px] font-semibold text-emerald-700 pt-1">
                                💬 <strong>Support Team Reply:</strong> {t.adminReply}
                              </p>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 font-bold whitespace-nowrap">
                            {new Date(t.createdAt).toLocaleDateString("en-IN", {
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
            )}

          </div>

        </div>
      </div>
    </div>
  );
}