"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShoppingBag,
  ShieldCheck,
  Truck,
  CreditCard,
  User,
  ArrowRight,
  Loader2,
  CheckCircle2,
  Lock,
  MapPin,
  Phone,
  Mail,
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

export default function CheckoutPage() {
  const router = useRouter();

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Customer Details Form State
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("Jaipur");
  const [state, setState] = useState("Rajasthan");
  const [pincode, setPincode] = useState("302020");
  const [paymentMethod, setPaymentMethod] = useState<"PREPAID" | "COD">("PREPAID");

  const [currentUser, setCurrentUser] = useState<{ id?: string; name?: string; phone?: string; email?: string } | null>(null);

  useEffect(() => {
    // 1. Check Authentication on Load
    try {
      const stored = localStorage.getItem("cb_user") || localStorage.getItem("cb_customer");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && (parsed.id || parsed.userId)) {
          setCurrentUser(parsed);
          if (parsed.name) setFullName(parsed.name);
          if (parsed.phone) setPhone(parsed.phone);
          if (parsed.email) setEmail(parsed.email);
        }
      }
    } catch {
      setCurrentUser(null);
    }

    // 2. Load Cart Items
    try {
      const savedCart = localStorage.getItem("cb_cart");
      if (savedCart) {
        const parsed = JSON.parse(savedCart);
        if (Array.isArray(parsed)) {
          setCartItems(parsed);
        }
      }
    } catch {
      setCartItems([]);
    }
  }, []);

  const totalAmount = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (cartItems.length === 0) {
      setErrorMsg("Your cart is empty.");
      return;
    }

    // Check if user is logged in before sending request
    const storedUser = localStorage.getItem("cb_user") || localStorage.getItem("cb_customer");
    let activeUserId = "";
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        activeUserId = parsedUser.id || parsedUser.userId || "";
      } catch {}
    }

    if (!activeUserId) {
      alert("Unauthorized! Please login to your account to place an order.");
      router.push("/login?redirect=/checkout");
      return;
    }

    const cleanPhone = phone.replace(/\D/g, "").slice(-10);
    if (!fullName.trim() || cleanPhone.length !== 10 || !street.trim() || !pincode.trim()) {
      setErrorMsg("Please fill out all required shipping details correctly (10-digit mobile number required).");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: activeUserId,
          items: cartItems,
          customerDetails: {
            fullName: fullName.trim(),
            phone: cleanPhone,
            email: email.trim() || `${cleanPhone}@catchbuddy.in`,
            street: street.trim(),
            city: city.trim(),
            state: state.trim(),
            pincode: pincode.trim(),
          },
          paymentMethod: paymentMethod,
          totalAmount: totalAmount,
        }),
      });

      const data = await res.json();

      if (res.status === 401 || !data.success) {
        alert(data.error || "Unauthorized! Please login to your account to place an order.");
        router.push("/login?redirect=/checkout");
        return;
      }

      if (data.success) {
        localStorage.removeItem("cb_cart");
        window.dispatchEvent(new Event("storage"));
        setSuccessMsg("Order placed successfully! Redirecting...");
        setTimeout(() => {
          router.push(`/order-success?orderId=${data.orderNumber || data.orderId}`);
        }, 1500);
      }
    } catch {
      setErrorMsg("Network error while placing order.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20 text-slate-900 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 px-4 sm:px-8 py-3 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center p-1">
              <Image src="/logo.png" alt="CatchBuddy" width={36} height={36} className="w-full h-full object-contain" priority />
            </div>
            <span className="text-xl font-black tracking-tight text-slate-950">
              Catch<span className="text-emerald-600">Buddy</span> Checkout
            </span>
          </Link>
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
            <ShieldCheck className="w-4 h-4" /> 100% Secure Checkout
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-8 mt-6">
        {errorMsg && (
          <div className="mb-4 p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-2xl">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            {successMsg}
          </div>
        )}

        {cartItems.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 max-w-lg mx-auto mt-10 shadow-sm">
            <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
            <h2 className="text-lg font-black text-slate-900">Your cart is empty</h2>
            <p className="text-xs text-slate-500 font-medium">Add some items to your cart before proceeding to checkout.</p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl text-xs font-black transition hover:bg-emerald-700"
            >
              Start Shopping <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Shipping & Payment */}
            <div className="lg:col-span-7 space-y-6">
              {/* Shipping Details Box */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-sm">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                  <MapPin className="w-5 h-5 text-emerald-600" />
                  <h2 className="text-base font-black text-slate-900">Shipping Address & Details</h2>
                </div>

                <div className="space-y-3.5 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Full Name</label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Enter full name"
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:outline-emerald-600"
                      />
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Mobile Number (Verified)</label>
                      <div className="relative">
                        <input
                          type="tel"
                          required
                          maxLength={10}
                          value={phone}
                          onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                          placeholder="10-digit mobile"
                          className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:outline-emerald-600"
                        />
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      </div>
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Email Address</label>
                      <div className="relative">
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="email@example.com"
                          className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:outline-emerald-600"
                        />
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Street Address / House No.</label>
                    <input
                      type="text"
                      required
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      placeholder="House/Flat no., Street name, Landmark"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:outline-emerald-600"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">City</label>
                      <input
                        type="text"
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:outline-emerald-600"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">State</label>
                      <input
                        type="text"
                        required
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:outline-emerald-600"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Pincode</label>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:outline-emerald-600"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method Box */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-sm">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                  <CreditCard className="w-5 h-5 text-emerald-600" />
                  <h2 className="text-base font-black text-slate-900">Payment Method</h2>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("PREPAID")}
                    className={`p-4 rounded-2xl border text-left transition flex flex-col gap-1 cursor-pointer ${
                      paymentMethod === "PREPAID"
                        ? "border-emerald-600 bg-emerald-50/50 text-emerald-950"
                        : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>Online / Prepaid</span>
                      <span className="px-2 py-0.5 bg-emerald-600 text-white text-[9px] rounded-md font-black">SAVE 5%</span>
                    </div>
                    <span className="text-[11px] font-medium text-slate-500">UPI, Card, NetBanking</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("COD")}
                    className={`p-4 rounded-2xl border text-left transition flex flex-col gap-1 cursor-pointer ${
                      paymentMethod === "COD"
                        ? "border-emerald-600 bg-emerald-50/50 text-emerald-950"
                        : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300"
                    }`}
                  >
                    <span>Cash on Delivery</span>
                    <span className="text-[11px] font-medium text-slate-500">Pay when order arrives</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Order Summary */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-sm sticky top-20">
                <h2 className="text-base font-black text-slate-900 pb-3 border-b border-slate-100">Order Summary</h2>

                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {cartItems.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 text-xs">
                      <div className="w-12 h-12 bg-slate-100 rounded-xl overflow-hidden shrink-0 border border-slate-200">
                        <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-slate-900 line-clamp-1">{item.title}</h4>
                        <p className="text-slate-500 text-[11px]">Qty: {item.quantity}</p>
                      </div>
                      <div className="font-black text-slate-950">₹{item.price * item.quantity}</div>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-slate-100 space-y-2 text-xs font-bold text-slate-600">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="text-slate-950 font-mono">₹{totalAmount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span className="text-emerald-600">FREE</span>
                  </div>
                  <div className="flex justify-between text-sm font-black text-slate-950 pt-2 border-t border-slate-100">
                    <span>Total Amount</span>
                    <span className="font-mono text-emerald-700">₹{totalAmount}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-black transition shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                  <span>Place Order Now (₹{totalAmount})</span>
                </button>

                <div className="flex items-center justify-center gap-2 text-[11px] font-bold text-slate-400 pt-2">
                  <Truck className="w-4 h-4 text-emerald-600" />
                  <span>Fast Delivery Pan India • Easy Returns</span>
                </div>
              </div>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}