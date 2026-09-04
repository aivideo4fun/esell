"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Trash2,
  Plus,
  Minus,
  ShieldCheck,
  Truck,
  CreditCard,
  ShoppingBag,
  Tag,
  Loader2,
} from "lucide-react";

interface CartItem {
  productId: string;
  slug: string;
  title: string;
  price: number;
  originalPrice: number;
  image: string;
  quantity: number;
  selectedSize?: string | null;
  selectedColor?: string | null;
}

export default function CartPage() {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [couponCode, setCouponCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [couponMsg, setCouponMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // Address form fields
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("cb_cart");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setItems(parsed);
      }
    } catch {}
  }, []);

  const updateQuantity = (index: number, newQty: number) => {
    if (newQty <= 0) {
      removeItem(index);
      return;
    }
    const updated = [...items];
    updated[index].quantity = newQty;
    setItems(updated);
    localStorage.setItem("cb_cart", JSON.stringify(updated));
  };

  const removeItem = (index: number) => {
    const updated = items.filter((_, i) => i !== index);
    setItems(updated);
    localStorage.setItem("cb_cart", JSON.stringify(updated));
  };

  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const totalSavings = items.reduce(
    (acc, item) => acc + (item.originalPrice - item.price) * item.quantity,
    0
  );
  const finalTotal = Math.max(0, subtotal - appliedDiscount);

  // Apply Coupon Check
  const handleApplyCoupon = () => {
    if (couponCode.trim().toUpperCase() === "CATCH10") {
      const discount = Math.round(subtotal * 0.1);
      setAppliedDiscount(discount);
      setCouponMsg("CATCH10 applied! 10% Extra Saved");
    } else {
      setCouponMsg("Invalid coupon code");
      setAppliedDiscount(0);
    }
  };

  // Direct Order Placement via API
  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    if (!fullName || !phone || !street || !pincode) {
      alert("Please fill in your complete shipping address & mobile number.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          customerDetails: {
            name: fullName,
            phone,
            address: street,
            city: city || "Local",
            state: state || "State",
            pincode,
          },
          paymentMethod: "ONLINE",
          totalAmount: finalTotal,
        }),
      });

      const data = await res.json();
      if (data.success && data.order) {
        localStorage.removeItem("cb_cart");
        router.push(`/orders?placed=${data.order.orderNumber || data.order.id}`);
      } else {
        alert(data.error || "Order placement failed. Please try again.");
      }
    } catch {
      alert("Network error processing order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20 text-slate-900 font-sans">
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-4 sm:px-8 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="p-1 hover:bg-slate-100 rounded-lg text-slate-700 inline-flex items-center gap-1 text-xs font-bold">
            <ArrowLeft className="w-4 h-4" /> Continue Shopping
          </Link>
          <span className="text-sm font-black text-slate-950">
            Shopping Cart ({items.length})
          </span>
          <div className="w-6" />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-8 mt-6">
        {items.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 max-w-md mx-auto my-12">
            <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
            <h2 className="text-base font-black text-slate-900">Your Cart is Empty</h2>
            <p className="text-xs text-slate-500 font-medium">Add trending gadgets to start checkout.</p>
            <Link href="/" className="inline-block px-6 py-3 bg-emerald-600 text-white rounded-xl text-xs font-black">
              Explore Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Cart Items List */}
            <div className="md:col-span-2 space-y-3">
              {items.map((item, idx) => (
                <div key={idx} className="bg-white p-4 rounded-2xl border border-slate-200 flex gap-3 shadow-2xs">
                  <img src={item.image} alt={item.title} className="w-20 h-20 rounded-xl object-cover bg-slate-50" />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xs font-black text-slate-900 line-clamp-1">{item.title}</h3>
                      <div className="text-[11px] font-bold text-slate-500 mt-0.5 space-x-2">
                        {item.selectedSize && <span>Size: {item.selectedSize}</span>}
                        {item.selectedColor && <span>Color: {item.selectedColor}</span>}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <div className="text-xs font-black text-slate-950">
                        ₹{item.price * item.quantity}
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg p-0.5">
                          <button
                            onClick={() => updateQuantity(idx, item.quantity - 1)}
                            className="p-1 text-slate-600 hover:bg-slate-200 rounded"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-6 text-center text-[11px] font-black">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(idx, item.quantity + 1)}
                            className="p-1 text-slate-600 hover:bg-slate-200 rounded"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(idx)}
                          className="p-1 text-rose-500 hover:bg-rose-50 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Delivery Address Form */}
              <div className="bg-white p-5 rounded-3xl border border-slate-200 space-y-4">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  Shipping & Delivery Address
                </h3>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Full Name</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Rahul Sharma"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-600 font-medium"
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">10-Digit Mobile</label>
                    <input
                      required
                      type="tel"
                      maxLength={10}
                      placeholder="e.g. 9876543210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-600 font-medium"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Street Address / House No.</label>
                    <input
                      required
                      type="text"
                      placeholder="Flat 101, Green Valley Apartments"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-600 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">City</label>
                    <input
                      type="text"
                      placeholder="Jaipur"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-600 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Pincode</label>
                    <input
                      required
                      type="text"
                      maxLength={6}
                      placeholder="302020"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-600 font-medium"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Price Summary & Checkout Card */}
            <div className="space-y-4">
              {/* Coupon Box */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Promo code (e.g. CATCH10)"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="w-full pl-8 pr-2 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none uppercase"
                    />
                  </div>
                  <button
                    onClick={handleApplyCoupon}
                    className="px-3.5 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl cursor-pointer hover:bg-black transition"
                  >
                    Apply
                  </button>
                </div>
                {couponMsg && (
                  <p className={`text-[11px] font-bold ${appliedDiscount > 0 ? "text-emerald-700" : "text-rose-600"}`}>
                    {couponMsg}
                  </p>
                )}
              </div>

              {/* Order Summary */}
              <div className="bg-white p-5 rounded-3xl border border-slate-200 space-y-3">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Price Details</h3>
                <div className="space-y-2 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-bold text-slate-900">₹{subtotal}</span>
                  </div>
                  {totalSavings > 0 && (
                    <div className="flex justify-between text-emerald-600 font-bold">
                      <span>Total Savings</span>
                      <span>-₹{totalSavings}</span>
                    </div>
                  )}
                  {appliedDiscount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-bold">
                      <span>Coupon Discount</span>
                      <span>-₹{appliedDiscount}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Delivery Charges</span>
                    <span className="text-emerald-600 font-bold">FREE</span>
                  </div>
                  <div className="border-t border-slate-100 pt-3 flex justify-between text-sm font-black text-slate-950">
                    <span>Grand Total</span>
                    <span className="text-emerald-700">₹{finalTotal}</span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={loading}
                  className="w-full mt-4 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-black transition cursor-pointer shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Place Order (Safe Prepaid)
                </button>
              </div>

              {/* Trust Badges */}
              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-2 text-[11px] font-bold text-emerald-900">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" /> 100% Buyer Protection Guaranteed
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-emerald-600 shrink-0" /> Express Dispatch within 24 Hours
                </div>
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-600 shrink-0" /> Safe & Encrypted Payment Checkout
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}