"use client";

import { useState } from "react";
import { useCart } from "@/hooks/useCart";
import { ShieldCheck, Truck, Lock, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotalPrice, clearCart } = useCart();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "Rajasthan",
    pincode: "",
  });

  const subtotal = getTotalPrice();
  const shippingFee = 0; // Free shipping on prepaid orders
  const totalAmount = subtotal + shippingFee;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          items,
          totalAmount,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        clearCart();
        alert(`Order Placed Successfully! 🎉\nOrder ID: ${data.orderId}\nPrepaid payment confirmed.`);
        router.push("/admin/orders");
      } else {
        alert(data.error || "Order placement failed.");
      }
    } catch (err) {
      alert("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-black text-gray-950">Your bag is empty</h2>
        <p className="text-sm text-gray-600 mt-2 mb-6">Add products before proceeding to prepaid checkout.</p>
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Header */}
      <div className="mb-8">
        <Link href="/shop" className="text-xs font-semibold text-gray-600 hover:text-black flex items-center gap-1 mb-2">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to shopping
        </Link>
        <h1 className="text-3xl font-black text-gray-950">Prepaid Checkout</h1>
        <p className="text-sm text-gray-600 mt-1">Direct pan-India dispatch via trusted logistics</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Column: Delivery Form */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-sm space-y-6">
          <div>
            <h2 className="text-lg font-black text-gray-950">Shipping Details</h2>
            <p className="text-xs text-gray-600 font-medium">Provide accurate details for BaapStore order dispatch</p>
          </div>

          <form onSubmit={handlePayment} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider mb-1.5">
                Full Name *
              </label>
              <input
                required
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="e.g. Rahul Sharma"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 text-gray-950 font-medium placeholder:text-gray-400 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black bg-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider mb-1.5">
                  Phone Number (For Delivery/OTP) *
                </label>
                <input
                  required
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="10-digit mobile number"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 text-gray-950 font-medium placeholder:text-gray-400 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider mb-1.5">
                  Email *
                </label>
                <input
                  required
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="order-updates@domain.com"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 text-gray-950 font-medium placeholder:text-gray-400 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider mb-1.5">
                Street Address / House No. *
              </label>
              <input
                required
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Flat / House No., Landmark, Area"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 text-gray-950 font-medium placeholder:text-gray-400 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black bg-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider mb-1.5">
                  City *
                </label>
                <input
                  required
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="City"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 text-gray-950 font-medium placeholder:text-gray-400 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider mb-1.5">
                  State *
                </label>
                <input
                  required
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  placeholder="State"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 text-gray-950 font-medium placeholder:text-gray-400 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider mb-1.5">
                  Pin Code *
                </label>
                <input
                  required
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleInputChange}
                  placeholder="6-digit PIN"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 text-gray-950 font-medium placeholder:text-gray-400 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black bg-white"
                />
              </div>
            </div>

            {/* Prepaid Notice Badge */}
            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 flex items-start gap-3 mt-4">
              <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div className="text-xs text-gray-900">
                <span className="font-bold text-blue-900">Prepaid Guarantee:</span> Safe and encrypted checkout. Tracking link will be dispatched to your phone via SMS.
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gray-950 hover:bg-blue-600 disabled:opacity-60 text-white font-bold rounded-2xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg text-base cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              {loading ? "Processing Secure Order..." : `Pay ₹${totalAmount} & Confirm Order`}
            </button>
          </form>
        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-sm space-y-4">
            <h2 className="text-lg font-black text-gray-950">Order Summary ({items.length})</h2>

            <div className="divide-y divide-gray-100 max-h-72 overflow-y-auto space-y-3 pt-2">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 pt-3">
                  <img src={item.image} alt={item.title} className="w-14 h-14 rounded-xl object-cover bg-gray-50 border border-gray-100" />
                  <div className="flex-1">
                    <h4 className="text-xs font-bold text-gray-900 line-clamp-1">{item.title}</h4>
                    <p className="text-xs text-gray-500 font-medium">Qty: {item.quantity}</p>
                    <p className="text-xs font-black text-gray-950 mt-1">₹{item.price * item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-gray-600 font-medium">
                <span>Subtotal</span>
                <span className="text-gray-950 font-bold">₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-gray-600 font-medium">
                <span>Shipping</span>
                <span className="text-green-600 font-bold">FREE (Prepaid Offer)</span>
              </div>
              <div className="flex justify-between text-base font-black text-gray-950 pt-2 border-t border-gray-100">
                <span>Total Amount</span>
                <span>₹{totalAmount}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-200 text-xs text-gray-700 font-medium">
            <Truck className="w-5 h-5 text-gray-950 shrink-0" />
            <span>Pan-India standard dispatch within 24–48 working hours.</span>
          </div>
        </div>

      </div>
    </div>
  );
}