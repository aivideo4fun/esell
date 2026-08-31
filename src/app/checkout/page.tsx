/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ShieldCheck, 
  Truck, 
  Lock, 
  Sparkles, 
  ArrowLeft, 
  CheckCircle2, 
  Loader2, 
  Zap, 
  ShoppingBag,
  User,
  Phone,
  X
} from "lucide-react";
import { useCart } from "@/hooks/useCart";

interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature?: string;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: {
    name: string;
    contact: string;
  };
  theme: {
    color: string;
  };
  handler: (response: RazorpayResponse) => void;
  modal: {
    ondismiss: () => void;
  };
}

interface RazorpayInstance {
  open: () => void;
  on?: (event: string, callback: (response: unknown) => void) => void;
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface CustomerUser {
  id?: string;
  name?: string;
  phone?: string;
}

interface PlacedOrder {
  id: string;
  orderNumber: string;
}

export default function CheckoutPage() {
  const { items, clearCart } = useCart();

  const [currentUser, setCurrentUser] = useState<CustomerUser | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authForm, setAuthForm] = useState({ name: "", phone: "", email: "" });

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    street: "",
    city: "",
    state: "Rajasthan",
    pincode: "",
  });

  const [orderSuccess, setOrderSuccess] = useState<PlacedOrder | null>(null);

  useEffect(() => {
    const checkCustomerAuth = async () => {
      try {
        const res = await fetch("/api/auth/customer");
        const data = await res.json();
        if (data.authenticated && data.user) {
          setCurrentUser(data.user);
          setFormData((prev) => ({
            ...prev,
            fullName: data.user.name || prev.fullName,
            phone: data.user.phone || prev.phone,
          }));
        }
      } catch (error) {
        console.error("Auth verify error:", error);
      }
    };
    checkCustomerAuth();
  }, []);

  const cartSubtotal = items.reduce((sum, item) => {
    const itemPrice = Number(item.price) || 0;
    const itemQty = Number(item.quantity) || 1;
    return sum + itemPrice * itemQty;
  }, 0);

  const prepaidDiscount = cartSubtotal > 0 ? 50 : 0;
  const finalPayable = Math.max(0, cartSubtotal - prepaidDiscount);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCustomerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (authForm.phone.length < 10) {
      alert("Please enter a valid 10-digit mobile number");
      return;
    }

    setAuthLoading(true);
    try {
      const res = await fetch("/api/auth/customer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(authForm),
      });

      const data = await res.json();
      if (data.success && data.user) {
        setCurrentUser(data.user);
        setFormData((prev) => ({
          ...prev,
          fullName: data.user.name || authForm.name,
          phone: data.user.phone || authForm.phone,
        }));
        setShowLoginModal(false);
      } else {
        alert(data.error || "Login failed. Please try again.");
      }
    } catch {
      alert("Network error. Please try again.");
    } finally {
      setAuthLoading(false);
    }
  };

  const finalizeOrderInDB = async (orderId: string, payId: string) => {
    try {
      const verifyRes = await fetch("/api/checkout/verify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          razorpay_order_id: orderId,
          razorpay_payment_id: payId,
          shippingDetails: formData,
          cartItems: items,
          totalAmount: finalPayable,
        }),
      });

      const verifyData = await verifyRes.json();
      if (verifyData.success) {
        clearCart();
        setOrderSuccess(verifyData.order);
      } else {
        alert("Order saving error: " + (verifyData.error || "Unknown"));
      }
    } catch {
      alert("Failed to save order in database.");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) {
      setAuthForm({
        name: formData.fullName,
        phone: formData.phone,
        email: "",
      });
      setShowLoginModal(true);
      return;
    }

    if (items.length === 0) {
      alert("Cart is empty!");
      return;
    }

    if (formData.phone.length < 10) {
      alert("Please enter a valid 10-digit mobile number.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/checkout/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: finalPayable }),
      });

      const orderData = await res.json();

      if (!orderData.success) {
        throw new Error(orderData.error || "Failed to create order");
      }

      if (orderData.isMock || typeof window === "undefined" || !window.Razorpay) {
        await finalizeOrderInDB(orderData.orderId, `pay_mock_${Date.now()}`);
        return;
      }

      const options: RazorpayOptions = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "CatchBuddy Store",
        description: "Prepaid Order Checkout",
        order_id: orderData.orderId,
        prefill: {
          name: formData.fullName,
          contact: formData.phone,
        },
        theme: {
          color: "#065f46",
        },
        handler: async function (response: RazorpayResponse) {
          await finalizeOrderInDB(response.razorpay_order_id, response.razorpay_payment_id);
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Failed to initiate payment";
      alert(errorMsg);
      setLoading(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center p-4 bg-white">
        <div className="max-w-lg w-full bg-white rounded-3xl border border-gray-200 p-8 text-center space-y-6 shadow-xl">
          <div className="w-16 h-16 bg-[#f0fdf4] text-[#16a34a] border border-[#bbf7d0] rounded-2xl flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#065f46] bg-[#f0fdf4] border border-[#bbf7d0] px-3 py-1 rounded-full">
              Payment Confirmed
            </span>
            <h2 className="text-2xl font-black text-[#0f172a]">Order Placed Successfully!</h2>
            <p className="text-xs font-bold text-[#64748b]">
              Order ID: <span className="text-[#16a34a] font-black">#{orderSuccess.orderNumber}</span>
            </p>
          </div>

          <div className="bg-[#f8fafc] p-4 rounded-2xl border border-gray-200 text-left text-xs font-bold text-[#0f172a] space-y-1">
            <p className="font-black text-[#64748b]">Delivery Address:</p>
            <p>{formData.fullName} ({formData.phone})</p>
            <p>{formData.street}, {formData.city}, {formData.state} - {formData.pincode}</p>
            <p className="text-[#16a34a] pt-1 flex items-center gap-1 font-black">
              <Truck className="w-3.5 h-3.5" /> Express Dispatch within 24 Hours
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              href="/admin/orders"
              className="flex-1 py-3.5 bg-gray-100 hover:bg-gray-200 text-[#0f172a] text-xs font-bold rounded-2xl transition text-center"
            >
              View in Admin Orders
            </Link>
            <Link
              href="/shop"
              className="flex-1 py-3.5 bg-[#065f46] hover:bg-[#044e39] text-white text-xs font-black rounded-2xl transition text-center shadow-md shadow-emerald-950/20"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-4 space-y-4 bg-white">
        <div className="w-16 h-16 rounded-full bg-[#f0fdf4] flex items-center justify-center mx-auto">
          <ShoppingBag className="w-8 h-8 text-[#16a34a]" />
        </div>
        <h2 className="text-xl font-black text-[#0f172a]">Your Shopping Cart is Empty</h2>
        <p className="text-xs font-semibold text-[#64748b] max-w-sm">
          Add items to your cart before proceeding to checkout.
        </p>
        <Link
          href="/shop"
          className="px-6 py-3 bg-[#065f46] text-white text-xs font-black rounded-2xl hover:bg-[#044e39] transition shadow-md shadow-emerald-950/20"
        >
          Explore Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[#f8fafc] min-h-screen py-8 sm:py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Navigation Bar */}
        <div className="flex items-center justify-between">
          <Link href="/shop" className="inline-flex items-center gap-2 text-xs font-bold text-[#64748b] hover:text-[#065f46] transition">
            <ArrowLeft className="w-4 h-4" /> Return to Store
          </Link>
          <div className="flex items-center gap-3">
            {currentUser ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#065f46] bg-[#f0fdf4] px-3.5 py-1 rounded-full border border-[#bbf7d0]">
                <User className="w-3.5 h-3.5 text-[#16a34a]" /> Logged in: {currentUser.name || currentUser.phone}
              </span>
            ) : (
              <button
                onClick={() => setShowLoginModal(true)}
                className="inline-flex items-center gap-1 text-xs font-bold text-[#16a34a] hover:underline cursor-pointer"
              >
                Already have an account? Login
              </button>
            )}
            <div className="inline-flex items-center gap-1.5 text-xs font-black text-[#065f46] bg-[#f0fdf4] px-3.5 py-1 rounded-full border border-[#bbf7d0]">
              <ShieldCheck className="w-4 h-4 text-[#16a34a]" /> 256-bit Encrypted
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Shipping Form */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-xs space-y-6">
            <div className="border-b border-gray-100 pb-4">
              <h2 className="text-xl font-black text-[#0f172a] flex items-center gap-2">
                <Truck className="w-5 h-5 text-[#16a34a]" /> Express Delivery Address
              </h2>
            </div>

            <form id="checkout-form" onSubmit={handleCheckoutSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="text-[11px] font-black text-[#0f172a] uppercase tracking-wider block mb-1.5">
                  Full Customer Name *
                </label>
                <input
                  required
                  type="text"
                  name="fullName"
                  placeholder="e.g. Rahul Sharma"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl text-xs font-semibold text-[#0f172a] placeholder:text-[#64748b] focus:border-[#16a34a] focus:ring-1 focus:ring-[#16a34a] focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-[11px] font-black text-[#0f172a] uppercase tracking-wider block mb-1.5">
                  WhatsApp / Contact Phone *
                </label>
                <input
                  required
                  type="tel"
                  name="phone"
                  placeholder="10-digit mobile number"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl text-xs font-semibold text-[#0f172a] placeholder:text-[#64748b] focus:border-[#16a34a] focus:ring-1 focus:ring-[#16a34a] focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-[11px] font-black text-[#0f172a] uppercase tracking-wider block mb-1.5">
                  Flat, House No., Street &amp; Landmark *
                </label>
                <input
                  required
                  type="text"
                  name="street"
                  placeholder="House #12, Main Road"
                  value={formData.street}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl text-xs font-semibold text-[#0f172a] placeholder:text-[#64748b] focus:border-[#16a34a] focus:ring-1 focus:ring-[#16a34a] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-black text-[#0f172a] uppercase tracking-wider block mb-1.5">
                  City / Town *
                </label>
                <input
                  required
                  type="text"
                  name="city"
                  placeholder="e.g. Jaipur"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl text-xs font-semibold text-[#0f172a] placeholder:text-[#64748b] focus:border-[#16a34a] focus:ring-1 focus:ring-[#16a34a] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-black text-[#0f172a] uppercase tracking-wider block mb-1.5">
                  Pincode (6-Digits) *
                </label>
                <input
                  required
                  type="text"
                  name="pincode"
                  maxLength={6}
                  placeholder="302001"
                  value={formData.pincode}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl text-xs font-semibold text-[#0f172a] placeholder:text-[#64748b] focus:border-[#16a34a] focus:ring-1 focus:ring-[#16a34a] focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-[11px] font-black text-[#0f172a] uppercase tracking-wider block mb-1.5">
                  State *
                </label>
                <input
                  required
                  type="text"
                  name="state"
                  placeholder="Rajasthan"
                  value={formData.state}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl text-xs font-semibold text-[#0f172a] focus:border-[#16a34a] focus:ring-1 focus:ring-[#16a34a] focus:outline-none"
                />
              </div>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-xs space-y-6">
              <h3 className="text-base font-black text-[#0f172a] border-b border-gray-100 pb-3">
                Order Summary ({items.length} item{items.length > 1 ? "s" : ""})
              </h3>

              <div className="divide-y divide-gray-100 max-h-56 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={item.id} className="py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.image || "/placeholder.png"}
                        alt=""
                        className="w-12 h-12 rounded-xl object-contain border border-gray-200 bg-[#f8fafc]"
                      />
                      <div>
                        <p className="font-black text-xs text-[#0f172a] line-clamp-1">{item.title}</p>
                        <p className="text-[10px] text-[#64748b] font-bold">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <span className="font-black text-xs text-[#0f172a]">
                      ₹{(Number(item.price) || 0) * (Number(item.quantity) || 1)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="bg-[#f0fdf4] border border-[#bbf7d0] p-3.5 rounded-2xl flex items-center gap-2.5 text-[#065f46]">
                <Sparkles className="w-4 h-4 text-[#16a34a] shrink-0" />
                <p className="text-xs font-bold leading-snug">
                  <span className="font-black text-[#16a34a]">₹50 Instant Discount</span> applied on UPI Prepaid checkout!
                </p>
              </div>

              <div className="space-y-2 border-t border-gray-100 pt-3 text-xs font-bold">
                <div className="flex justify-between text-[#64748b]">
                  <span>Cart Items Total:</span>
                  <span className="text-[#0f172a]">₹{cartSubtotal}</span>
                </div>
                <div className="flex justify-between text-[#16a34a]">
                  <span>Prepaid UPI Saving:</span>
                  <span className="font-black">- ₹{prepaidDiscount}</span>
                </div>
                <div className="flex justify-between text-[#64748b]">
                  <span>Courier Delivery:</span>
                  <span className="text-[#16a34a] font-black">FREE</span>
                </div>
                <div className="flex justify-between text-base font-black text-[#0f172a] pt-3 border-t border-gray-100">
                  <span>Final Amount to Pay:</span>
                  <span className="text-xl font-black text-[#065f46]">₹{finalPayable}</span>
                </div>
              </div>

              <button
                type="submit"
                form="checkout-form"
                disabled={loading}
                className="w-full py-4 bg-[#065f46] hover:bg-[#044e39] text-white rounded-2xl text-xs font-black flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-950/20 active:scale-95 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Zap className="w-4 h-4 fill-white" /> 
                    {currentUser ? `Pay ₹${finalPayable} & Confirm Order` : "Continue to Login & Pay"}
                  </>
                )}
              </button>

              <div className="text-center space-y-1">
                <p className="text-[10px] text-[#64748b] font-semibold flex items-center justify-center gap-1">
                  <Lock className="w-3 h-3 text-[#16a34a]" /> Supports Google Pay, PhonePe, Paytm, Cards &amp; NetBanking
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Customer Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 select-none">
          <div className="bg-white rounded-3xl border border-gray-200 max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl relative">
            
            <button
              onClick={() => setShowLoginModal(false)}
              className="absolute right-4 top-4 p-2 rounded-full hover:bg-gray-100 transition text-[#64748b] hover:text-[#0f172a] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-1">
              <div className="w-12 h-12 bg-[#f0fdf4] border border-[#bbf7d0] text-[#16a34a] rounded-2xl flex items-center justify-center mx-auto">
                <User className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-[#0f172a]">Login / Register to Order</h3>
              <p className="text-xs text-[#64748b] font-semibold">
                Quick 1-step verification for live delivery tracking &amp; invoice
              </p>
            </div>

            <form onSubmit={handleCustomerLogin} className="space-y-4">
              <div>
                <label className="text-[11px] font-black text-[#0f172a] uppercase tracking-wider block mb-1.5">
                  Your Full Name
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Rahul Sharma"
                  value={authForm.name}
                  onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl text-xs font-semibold text-[#0f172a] placeholder:text-[#64748b] focus:border-[#16a34a] focus:ring-1 focus:ring-[#16a34a] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-black text-[#0f172a] uppercase tracking-wider block mb-1.5">
                  Mobile Number (WhatsApp) *
                </label>
                <div className="relative">
                  <input
                    required
                    type="tel"
                    placeholder="10-digit number"
                    maxLength={10}
                    value={authForm.phone}
                    onChange={(e) => setAuthForm({ ...authForm, phone: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-xs font-semibold text-[#0f172a] placeholder:text-[#64748b] focus:border-[#16a34a] focus:ring-1 focus:ring-[#16a34a] focus:outline-none"
                  />
                  <Phone className="w-4 h-4 text-[#64748b] absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-3.5 bg-[#065f46] hover:bg-[#044e39] text-white rounded-2xl text-xs font-black transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-950/20 active:scale-95 disabled:opacity-50"
              >
                {authLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Verify & Continue Checkout"
                )}
              </button>
            </form>

            <p className="text-[10px] text-[#64748b] text-center font-semibold">
              By continuing, you agree to our Terms &amp; Privacy Policy.
            </p>

          </div>
        </div>
      )}

    </div>
  );
}