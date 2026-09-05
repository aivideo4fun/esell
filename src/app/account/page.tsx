/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  CheckCircle2,
  Plus,
  ArrowLeft,
  Trash2,
  AlertCircle,
} from "lucide-react";

export default function CustomerAccountPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("account");
  const [loading, setLoading] = useState(true);

  // Profile Form States
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "Customer",
    email: "",
    phone: "",
    isEmailVerified: true,
  });

  // Data States
  const [orders, setOrders] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [wishlistCount, setWishlistCount] = useState<number>(0);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Address Form State
  const [newAddr, setNewAddr] = useState({
    fullName: "",
    phone: "",
    street: "",
    city: "",
    state: "Rajasthan",
    pincode: "",
  });
  const [addingAddr, setAddingAddr] = useState(false);
  const [deletingAddrId, setDeletingAddrId] = useState<string | null>(null);

  // Support State
  const [supportMsg, setSupportMsg] = useState({ subject: "", message: "" });
  const [submittingSupport, setSubmittingSupport] = useState(false);
  const [createdTicket, setCreatedTicket] = useState<any | null>(null);
  const [tickets, setTickets] = useState<any[]>([]);

  // 1. Wishlist Live Sync
  useEffect(() => {
    const updateWishlist = () => {
      try {
        const stored = localStorage.getItem("cb_wishlist");
        if (stored) {
          const parsed = JSON.parse(stored);
          setWishlistCount(Array.isArray(parsed) ? parsed.length : 0);
        } else {
          setWishlistCount(0);
        }
      } catch {
        setWishlistCount(0);
      }
    };

    updateWishlist();
    window.addEventListener("storage", updateWishlist);
    window.addEventListener("wishlist-updated", updateWishlist);

    return () => {
      window.removeEventListener("storage", updateWishlist);
      window.removeEventListener("wishlist-updated", updateWishlist);
    };
  }, []);

  // 2. Load Customer Data
  useEffect(() => {
    const loadAllCustomerData = async () => {
      try {
        setLoading(true);

        const storedCustomer =
          localStorage.getItem("cb_customer") || localStorage.getItem("cb_user");
        let activeEmail = "";
        let activePhone = "";

        if (storedCustomer) {
          try {
            const parsed = JSON.parse(storedCustomer);
            activeEmail = parsed.email?.includes("@catchbuddy.store")
              ? ""
              : parsed.email || "";
            activePhone = (parsed.mobile || parsed.phone || "").replace(/\D/g, "").slice(-10);
            setProfileData((prev) => ({
              ...prev,
              name: parsed.name || prev.name,
              email: activeEmail,
              phone: activePhone,
            }));
          } catch {}
        } else {
          router.push("/login");
          return;
        }

        // Live Profile Sync
        try {
          const resProf = await fetch(
            `/api/customer/profile?phone=${encodeURIComponent(activePhone)}&email=${encodeURIComponent(activeEmail)}`
          );
          const dataProf = await resProf.json();
          if (dataProf.success && dataProf.customer) {
            const cleanFetchedEmail = dataProf.customer.email?.includes("@catchbuddy.store")
              ? ""
              : dataProf.customer.email || activeEmail;
            activeEmail = cleanFetchedEmail;
            activePhone = (dataProf.customer.phone || activePhone).replace(/\D/g, "").slice(-10);

            setProfileData({
              name: dataProf.customer.name || "Customer",
              email: activeEmail,
              phone: activePhone,
              isEmailVerified: true,
            });
          }
        } catch {}

        // Orders
        try {
          const resOrders = await fetch("/api/orders");
          const dataOrders = await resOrders.json();
          if (dataOrders.success) setOrders(dataOrders.orders || []);
        } catch {}

        // Coupons
        try {
          const resCoupons = await fetch("/api/customer/coupons");
          const dataCoupons = await resCoupons.json();
          if (dataCoupons.success) setCoupons(dataCoupons.coupons || []);
        } catch {}

        // Addresses
        try {
          const resAddr = await fetch(
            `/api/customer/addresses?email=${encodeURIComponent(activeEmail)}&phone=${encodeURIComponent(activePhone)}`
          );
          const dataAddr = await resAddr.json();
          if (dataAddr.success) setAddresses(dataAddr.addresses || []);
        } catch {}

        // Support Tickets
        if (activeEmail) {
          try {
            const resTickets = await fetch(
              `/api/admin/tickets?email=${encodeURIComponent(activeEmail)}`,
              { cache: "no-store" }
            );
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
  }, [router]);

  // Real Email & Name Update
  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);
    try {
      const res = await fetch("/api/customer/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profileData.name.trim(),
          phone: profileData.phone.replace(/\D/g, "").slice(-10),
          email: profileData.email.trim().toLowerCase(),
        }),
      });
      const data = await res.json();
      if (data.success || res.ok) {
        localStorage.setItem("cb_customer", JSON.stringify(profileData));
        localStorage.setItem("cb_user", JSON.stringify(profileData));
        window.dispatchEvent(new Event("customer-auth-changed"));
        window.dispatchEvent(new Event("storage"));

        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (err) {
      console.error("Failed to update profile", err);
    } finally {
      setSaving(false);
    }
  };

  // Add Address
  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/customer/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newAddr,
          userEmail: profileData.email,
          userPhone: profileData.phone,
        }),
      });
      const data = await res.json();
      if (data.success && data.address) {
        setAddresses((prev) => [data.address, ...prev.slice(0, 4)]);
        setAddingAddr(false);
        setNewAddr({
          fullName: "",
          phone: "",
          street: "",
          city: "",
          state: "Rajasthan",
          pincode: "",
        });
      } else {
        alert(data.error || "Failed to add address");
      }
    } catch (err) {
      console.error("Failed to add address", err);
    }
  };

  // Delete Address
  const handleDeleteAddress = async (id: string) => {
    if (!confirm("Are you sure you want to delete this address?")) return;
    try {
      setDeletingAddrId(id);
      const res = await fetch(`/api/customer/addresses?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setAddresses((prev) => prev.filter((a) => a.id !== id));
      } else {
        alert(data.error || "Failed to delete address");
      }
    } catch {
      alert("Network error deleting address");
    } finally {
      setDeletingAddrId(null);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleLogout = () => {
    localStorage.removeItem("cb_customer");
    localStorage.removeItem("cb_user");
    document.cookie = "customer_id=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    window.dispatchEvent(new Event("customer-auth-changed"));
    window.dispatchEvent(new Event("storage"));
    window.location.href = "/";
  };

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
    { id: "orders", label: "My Orders", icon: Package, count: orders.length || undefined },
    { id: "track", label: "Track Order", icon: Truck },
    {
      id: "wishlist",
      label: "Wishlist",
      icon: Heart,
      link: "/wishlist",
      count: wishlistCount > 0 ? wishlistCount : undefined,
    },
    {
      id: "addresses",
      label: "Saved Addresses",
      icon: MapPin,
      count: addresses.length || undefined,
    },
    { id: "coupons", label: "Coupons", icon: TicketPercent, count: coupons.length || 1 },
    { id: "notifications", label: "Notifications", icon: Bell },
    {
      id: "support",
      label: "Help & Support",
      icon: HelpCircle,
      count: tickets.length > 0 ? tickets.length : undefined,
    },
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
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 font-sans text-slate-900">
      <div className="max-w-6xl mx-auto space-y-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Store
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
          {/* Left Navigation Sidebar */}
          <div className="md:col-span-1 bg-white rounded-3xl border border-slate-200 p-4 shadow-xs space-y-4">
            <div className="p-3 border-b border-slate-100 flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-base shrink-0">
                {(profileData.name || "C").slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-sm text-slate-900 truncate">
                  {profileData.name || "Customer"}
                </p>
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
                      className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition group"
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition" />
                        <span>{item.label}</span>
                      </div>
                      {item.count !== undefined && item.count > 0 ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-black bg-rose-50 text-rose-600 border border-rose-100">
                          {item.count}
                        </span>
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                      )}
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
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                          isActive ? "bg-white text-emerald-700" : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {item.count}
                      </span>
                    ) : (
                      <ChevronRight
                        className={`w-3.5 h-3.5 ${isActive ? "text-white/80" : "text-slate-300"}`}
                      />
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
                    Manage your name, real email address and mobile number.
                  </p>
                </div>

                <form onSubmit={handleProfileSave} className="space-y-5 max-w-xl">
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
                        onChange={(e) =>
                          setProfileData({ ...profileData, name: e.target.value })
                        }
                        className="w-full border border-slate-200 bg-white rounded-2xl pl-10 pr-4 py-3 text-xs font-bold text-slate-900 outline-none focus:border-emerald-500 transition shadow-2xs"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-slate-700">Email Address</label>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                        Primary Email
                      </span>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        required
                        placeholder="Enter real email address"
                        value={profileData.email}
                        onChange={(e) =>
                          setProfileData({ ...profileData, email: e.target.value })
                        }
                        className="w-full border border-slate-200 bg-white rounded-2xl pl-10 pr-4 py-3 text-xs font-bold text-slate-900 outline-none focus:border-emerald-500 transition shadow-2xs"
                      />
                    </div>
                  </div>

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
                        onChange={(e) =>
                          setProfileData({ ...profileData, phone: e.target.value })
                        }
                        className="w-full border border-slate-200 bg-white rounded-2xl pl-10 pr-4 py-3 text-xs font-bold text-slate-900 outline-none focus:border-emerald-500 transition shadow-2xs"
                      />
                    </div>
                  </div>

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

            {/* 2. ORDERS TAB */}
            {activeTab === "orders" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-black text-slate-900">Order History</h2>
                  <p className="text-xs text-slate-500">
                    Track and review all purchases placed on CatchBuddy.
                  </p>
                </div>

                {orders.length === 0 ? (
                  <div className="text-center py-12 space-y-3">
                    <Package className="w-12 h-12 text-slate-300 mx-auto" />
                    <p className="text-sm font-black text-slate-700">No Orders Placed Yet</p>
                    <Link
                      href="/"
                      className="inline-block px-5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold"
                    >
                      Browse Catalog
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div
                        key={order.id}
                        className="p-4 border border-slate-200 rounded-2xl space-y-3"
                      >
                        <div className="flex items-center justify-between text-xs border-b border-slate-100 pb-2">
                          <span className="font-mono font-bold text-slate-800">
                            #{order.id.slice(-6).toUpperCase()}
                          </span>
                          <span className="font-black text-emerald-600">₹{order.totalAmount}</span>
                        </div>
                        <p className="text-xs text-slate-500">
                          {new Date(order.createdAt).toLocaleDateString("en-IN")}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 3. TRACK ORDER TAB */}
            {activeTab === "track" && (
              <div className="space-y-6 max-w-xl">
                <div>
                  <h2 className="text-lg font-black text-slate-900">Live Package Tracking</h2>
                  <p className="text-xs text-slate-500">
                    Enter your Order ID to see real-time transit status.
                  </p>
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
                  <p className="text-[11px] text-emerald-700">
                    All orders are dispatched via Express Courier within 24 hours.
                  </p>
                </div>
              </div>
            )}

            {/* 4. SAVED ADDRESSES TAB */}
            {activeTab === "addresses" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-black text-slate-900">
                      Saved Addresses ({addresses.length}/5)
                    </h2>
                    <p className="text-xs text-slate-500">
                      Manage up to 5 shipping locations for instant 1-click checkout.
                    </p>
                  </div>
                  {addresses.length < 5 ? (
                    <button
                      onClick={() => setAddingAddr(!addingAddr)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-bold cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Address
                    </button>
                  ) : (
                    <span className="text-[11px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> Max 5 Saved
                    </span>
                  )}
                </div>

                {addingAddr && (
                  <form
                    onSubmit={handleAddAddress}
                    className="p-5 border border-emerald-200 bg-emerald-50/40 rounded-3xl space-y-3"
                  >
                    <h3 className="text-xs font-black text-emerald-950">Add New Shipping Location</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        required
                        placeholder="Receiver Full Name *"
                        value={newAddr.fullName}
                        onChange={(e) => setNewAddr({ ...newAddr, fullName: e.target.value })}
                        className="border bg-white rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:border-emerald-600"
                      />
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        placeholder="Mobile Number (10 Digits) *"
                        value={newAddr.phone}
                        onChange={(e) =>
                          setNewAddr({ ...newAddr, phone: e.target.value.replace(/\D/g, "") })
                        }
                        className="border bg-white rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:border-emerald-600"
                      />
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="Street, Flat, Landmark, Area *"
                      value={newAddr.street}
                      onChange={(e) => setNewAddr({ ...newAddr, street: e.target.value })}
                      className="w-full border bg-white rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:border-emerald-600"
                    />
                    <div className="grid grid-cols-3 gap-2">
                      <input
                        type="text"
                        required
                        placeholder="City *"
                        value={newAddr.city}
                        onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                        className="border bg-white rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:border-emerald-600"
                      />
                      <input
                        type="text"
                        required
                        placeholder="State *"
                        value={newAddr.state}
                        onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })}
                        className="border bg-white rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:border-emerald-600"
                      />
                      <input
                        type="text"
                        required
                        maxLength={6}
                        placeholder="Pincode *"
                        value={newAddr.pincode}
                        onChange={(e) =>
                          setNewAddr({ ...newAddr, pincode: e.target.value.replace(/\D/g, "") })
                        }
                        className="border bg-white rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:border-emerald-600"
                      />
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="submit"
                        className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold cursor-pointer hover:bg-emerald-700 transition"
                      >
                        Save Location
                      </button>
                      <button
                        type="button"
                        onClick={() => setAddingAddr(false)}
                        className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                {addresses.length === 0 ? (
                  <div className="text-center py-10 space-y-2 border border-dashed border-slate-200 rounded-3xl">
                    <MapPin className="w-8 h-8 text-slate-300 mx-auto" />
                    <p className="text-xs text-slate-400">No saved addresses yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {addresses.map((addr) => (
                      <div
                        key={addr.id}
                        className="p-4 border border-slate-200 rounded-2xl text-xs space-y-2 bg-white hover:border-slate-300 transition flex flex-col justify-between"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-black text-slate-900">{addr.fullName}</span>
                            <button
                              onClick={() => handleDeleteAddress(addr.id)}
                              disabled={deletingAddrId === addr.id}
                              className="text-slate-400 hover:text-rose-600 p-1 rounded-lg transition cursor-pointer"
                              title="Delete address"
                            >
                              {deletingAddrId === addr.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-600" />
                              ) : (
                                <Trash2 className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                          <p className="text-slate-500">
                            {addr.street}, {addr.city}, {addr.state} - {addr.pincode}
                          </p>
                          <p className="text-slate-700 font-semibold">📞 {addr.phone}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 5. COUPONS TAB */}
            {activeTab === "coupons" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-black text-slate-900">Available Coupons &amp; Offers</h2>
                  <p className="text-xs text-slate-500">
                    Apply discount codes at checkout for instant savings.
                  </p>
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
                      <p className="text-xs text-slate-600">
                        Save ₹50 automatically on UPI and Online payments.
                      </p>
                      <button
                        onClick={() => handleCopyCode("PREPAID50")}
                        className="px-3 py-1 bg-white border border-slate-200 text-xs font-bold rounded-lg cursor-pointer"
                      >
                        {copiedCode === "PREPAID50" ? "Copied!" : "Copy Code"}
                      </button>
                    </div>
                  ) : (
                    coupons.map((c) => (
                      <div
                        key={c.id}
                        className="p-5 border border-dashed border-emerald-300 rounded-2xl bg-emerald-50/40 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="px-3 py-1 bg-emerald-600 text-white font-mono font-bold text-xs rounded-lg">
                            {c.code}
                          </span>
                          <span className="text-xs font-black text-emerald-700">
                            {c.discountType === "PERCENTAGE"
                              ? `${c.discountValue}% OFF`
                              : `₹${c.discountValue} OFF`}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600">
                          {c.description || "Applicable on your cart total."}
                        </p>
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

            {/* 6. NOTIFICATIONS TAB */}
            {activeTab === "notifications" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-black text-slate-900">Notifications &amp; Alerts</h2>
                  <p className="text-xs text-slate-500">Live order status and alerts.</p>
                </div>

                <div className="space-y-3">
                  <div className="p-4 border border-slate-200 rounded-2xl text-xs space-y-1 bg-slate-50/50">
                    <p className="font-bold text-slate-900">⚡ Welcome to CatchBuddy!</p>
                    <p className="text-slate-500">
                      Prepaid orders are eligible for instant discount &amp; express delivery.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 7. SUPPORT TAB */}
            {activeTab === "support" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-black text-slate-900">Help &amp; Support Desk</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Raise a support ticket or track existing requests.
                  </p>
                </div>

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
                      Request submitted! Ticket Number:{" "}
                      <strong className="font-mono font-black">
                        {createdTicket.ticketNumber}
                      </strong>.
                    </p>
                  </div>
                )}

                <form onSubmit={handleSupportSubmit} className="space-y-4 max-w-xl">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1.5">
                      Issue Subject
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Order Delivery Delay / Return Request"
                      value={supportMsg.subject}
                      onChange={(e) =>
                        setSupportMsg({ ...supportMsg, subject: e.target.value })
                      }
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
                      placeholder="Please provide complete details regarding your query..."
                      value={supportMsg.message}
                      onChange={(e) =>
                        setSupportMsg({ ...supportMsg, message: e.target.value })
                      }
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

                <div className="pt-6 border-t border-slate-100 space-y-3">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                    Your Support Tickets ({tickets.length})
                  </h3>

                  {tickets.length === 0 ? (
                    <p className="text-xs text-slate-400 py-3">No support tickets raised yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {tickets.map((t) => (
                        <div
                          key={t.id}
                          className="p-4 border border-slate-200 rounded-2xl bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-black text-emerald-700">
                                {t.ticketNumber}
                              </span>
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