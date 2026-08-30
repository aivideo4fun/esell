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

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CheckoutPage() {
  const { items, clearCart } = useCart();

  // Auth State
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [authChecking, setAuthChecking] = useState(true);
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

  const [orderSuccess, setOrderSuccess] = useState<any>(null);

  // Check login status on load
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
      } catch (err) {
        console.error("Auth verify error:", err);
      } finally {
        setAuthChecking(false);
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

  // Instant Customer Login Handler
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
    } catch (err) {
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
    } catch (err) {
      alert("Failed to save order in database.");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 🔒 LOGIN GUARD: If user is not logged in, show login popup
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

      // If test mode
      if (orderData.isMock || !window.Razorpay) {
        await finalizeOrderInDB(orderData.orderId, `pay_mock_${Date.now()}`);
        return;
      }

      // Live Razorpay popup
      const options = {
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
          color: "#2563eb",
        },
        handler: async function (response: any) {
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
    } catch (err: any) {
      alert(err.message || "Failed to initiate payment");
      setLoading(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center p-4">
        <div className="max-w-lg w-full bg-white rounded-3xl border-2 border-gray-200 p-8 text-center space-y-6 shadow-xl">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-green-700 bg-green-50 px-3 py-1 rounded-full">
              Payment Confirmed
            </span>
            <h2 className="text-2xl font-black text-black">Order Placed Successfully!</h2>
            <p className="text-xs font-bold text-gray-500">
              Order ID: <span className="text-blue-600 font-black">#{orderSuccess.orderNumber}</span>
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 text-left text-xs font-bold text-black space-y-1">
            <p className="font-black text-gray-700">Delivery Address:</p>
            <p>{formData.fullName} ({formData.phone})</p>
            <p>{formData.street}, {formData.city}, {formData.state} - {formData.pincode}</p>
            <p className="text-green-700 pt-1 flex items-center gap-1">
              <Truck className="w-3.5 h-3.5" /> Express Dispatch within 24 Hours
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              href="/admin/orders"
              className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-black text-xs font-bold rounded-xl transition text-center"
            >
              View in Admin Orders
            </Link>
            <Link
              href="/shop"
              className="flex-1 py-3 bg-black hover:bg-blue-600 text-white text-xs font-black rounded-xl transition text-center"
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
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-4 space-y-4">
        <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto" />
        <h2 className="text-xl font-bold text-black">Your Shopping Cart is Empty</h2>
        <p className="text-xs text-gray-500 max-w-sm">
          Add items to your cart before proceeding to checkout.
        </p>
        <Link
          href="/shop"
          className="px-6 py-2.5 bg-black text-white text-xs font-black rounded-xl hover:bg-blue-600 transition"
        >
          Explore Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[#fafafa] min-h-screen py-8 sm:py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div className="flex items-center justify-between">
          <Link href="/shop" className="inline-flex items-center gap-2 text-xs font-bold text-gray-600 hover:text-black">
            <ArrowLeft className="w-4 h-4" /> Return to Store
          </Link>
          <div className="flex items-center gap-3">
            {currentUser ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-700 bg-white px-3 py-1 rounded-full border border-gray-200">
                <User className="w-3.5 h-3.5 text-blue-600" /> Logged in: {currentUser.name || currentUser.phone}
              </span>
            ) : (
              <button
                onClick={() => setShowLoginModal(true)}
                className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline cursor-pointer"
              >
                Already have an account? Login
              </button>
            )}
            <div className="inline-flex items-center gap-1.5 text-xs font-black text-green-700 bg-green-50 px-3 py-1 rounded-full border border-green-200">
              <ShieldCheck className="w-4 h-4" /> 256-bit Encrypted
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Shipping Form */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border-2 border-gray-200 shadow-sm space-y-6">
            <div className="border-b border-gray-100 pb-4">
              <h2 className="text-xl font-black text-black flex items-center gap-2">
                <Truck className="w-5 h-5 text-blue-600" /> Express Delivery Address
              </h2>
            </div>

            <form id="checkout-form" onSubmit={handleCheckoutSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="text-xs font-black text-black uppercase tracking-wider block mb-1">
                  Full Customer Name *
                </label>
                <input
                  required
                  type="text"
                  name="fullName"
                  placeholder="e.g. Rahul Sharma"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="w-full p-3 bg-white border-2 border-gray-300 rounded-xl text-xs font-bold text-black placeholder:text-gray-400 focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-black text-black uppercase tracking-wider block mb-1">
                  WhatsApp / Contact Phone *
                </label>
                <input
                  required
                  type="tel"
                  name="phone"
                  placeholder="10-digit mobile number"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full p-3 bg-white border-2 border-gray-300 rounded-xl text-xs font-bold text-black placeholder:text-gray-400 focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-black text-black uppercase tracking-wider block mb-1">
                  Flat, House No., Street &amp; Landmark *
                </label>
                <input
                  required
                  type="text"
                  name="street"
                  placeholder="House #12, Main Road"
                  value={formData.street}
                  onChange={handleInputChange}
                  className="w-full p-3 bg-white border-2 border-gray-300 rounded-xl text-xs font-bold text-black placeholder:text-gray-400 focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-black text-black uppercase tracking-wider block mb-1">
                  City / Town *
                </label>
                <input
                  required
                  type="text"
                  name="city"
                  placeholder="e.g. Jaipur"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="w-full p-3 bg-white border-2 border-gray-300 rounded-xl text-xs font-bold text-black placeholder:text-gray-400 focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-black text-black uppercase tracking-wider block mb-1">
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
                  className="w-full p-3 bg-white border-2 border-gray-300 rounded-xl text-xs font-bold text-black placeholder:text-gray-400 focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-black text-black uppercase tracking-wider block mb-1">
                  State *
                </label>
                <input
                  required
                  type="text"
                  name="state"
                  placeholder="Rajasthan"
                  value={formData.state}
                  onChange={handleInputChange}
                  className="w-full p-3 bg-white border-2 border-gray-300 rounded-xl text-xs font-bold text-black placeholder:text-gray-400 focus:border-blue-600 focus:outline-none"
                />
              </div>
            </form>
          </div>

          {/* Order Summary & Pay Button */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-gray-200 shadow-sm space-y-6">
              <h3 className="text-lg font-black text-black border-b border-gray-100 pb-3">
                Order Summary ({items.length} item{items.length > 1 ? "s" : ""})
              </h3>

              <div className="divide-y divide-gray-100 max-h-56 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={item.id} className="py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.image}
                        alt=""
                        className="w-12 h-12 rounded-xl object-contain border border-gray-200 bg-gray-50"
                      />
                      <div>
                        <p className="font-bold text-xs text-black line-clamp-1">{item.title}</p>
                        <p className="text-[10px] text-gray-500 font-semibold">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <span className="font-black text-xs text-black">
                      ₹{(Number(item.price) || 0) * (Number(item.quantity) || 1)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="bg-blue-50 border border-blue-200 p-3 rounded-2xl flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
                <p className="text-[11px] font-bold text-blue-950">
                  <span className="font-black text-blue-700">₹50 Instant Discount</span> applied on UPI Prepaid checkout!
                </p>
              </div>

              <div className="space-y-2 border-t border-gray-100 pt-3 text-xs font-bold text-black">
                <div className="flex justify-between text-gray-600">
                  <span>Cart Items Total:</span>
                  <span>₹{cartSubtotal}</span>
                </div>
                <div className="flex justify-between text-green-700">
                  <span>Prepaid UPI Saving:</span>
                  <span>- ₹{prepaidDiscount}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Courier Delivery:</span>
                  <span className="text-green-700 font-black">FREE</span>
                </div>
                <div className="flex justify-between text-base font-black text-black pt-3 border-t border-gray-200">
                  <span>Final Amount to Pay:</span>
                  <span className="text-blue-700">₹{finalPayable}</span>
                </div>
              </div>

              <button
                type="submit"
                form="checkout-form"
                disabled={loading}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-black flex items-center justify-center gap-2 transition shadow-lg shadow-blue-500/20 cursor-pointer disabled:opacity-50"
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
                <p className="text-[10px] text-gray-400 font-semibold flex items-center justify-center gap-1">
                  <Lock className="w-3 h-3 text-gray-400" /> Supports Google Pay, PhonePe, Paytm, Cards &amp; NetBanking
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* 🔒 CUSTOMER LOGIN MODAL POPUP */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border-2 border-gray-200 max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl relative">
            
            <button
              onClick={() => setShowLoginModal(false)}
              className="absolute right-4 top-4 p-2 rounded-full hover:bg-gray-100 transition text-gray-400 hover:text-black cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-1">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto">
                <User className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-black">Login / Register to Order</h3>
              <p className="text-xs text-gray-500 font-semibold">
                Quick 1-step verification for live delivery tracking &amp; invoice
              </p>
            </div>

            <form onSubmit={handleCustomerLogin} className="space-y-4">
              <div>
                <label className="text-xs font-black text-black uppercase tracking-wider block mb-1">
                  Your Full Name
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Rahul Sharma"
                  value={authForm.name}
                  onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                  className="w-full p-3 bg-white border-2 border-gray-300 rounded-xl text-xs font-bold text-black placeholder:text-gray-400 focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-black text-black uppercase tracking-wider block mb-1">
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
                    className="w-full pl-10 pr-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-xs font-bold text-black placeholder:text-gray-400 focus:border-blue-600 focus:outline-none"
                  />
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-3.5 bg-black hover:bg-blue-600 text-white rounded-xl text-xs font-black transition flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
              >
                {authLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Verify & Continue Checkout"
                )}
              </button>
            </form>

            <p className="text-[10px] text-gray-400 text-center font-semibold">
              By continuing, you agree to our Terms &amp; Privacy Policy.
            </p>

          </div>
        </div>
      )}

    </div>
  );
}