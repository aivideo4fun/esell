"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ShoppingBag,
  ArrowLeft,
  Trash2,
  Plus,
  Minus,
  ShieldCheck,
  CheckCircle2,
  CreditCard,
  Loader2,
  Lock,
  Tag,
  Check,
  X,
  MapPin,
} from "lucide-react";

interface CartItem {
  productId: string;
  slug: string;
  title: string;
  price: number;
  originalPrice?: number;
  image: string;
  quantity: number;
  selectedSize?: string | null;
  selectedColor?: string | null;
}

interface SavedAddress {
  id: string;
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
}

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);

  // Address form fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("302020");
  const [fetchingCity, setFetchingCity] = useState(false);

  // Saved Addresses State
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | "NEW">("NEW");

  // Customer identity
  const [customerEmail, setCustomerEmail] = useState("");

  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountAmount: number;
    discountPercent?: number | null;
  } | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");

  const abandonTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("cb_cart");
      if (savedCart) {
        const parsed = JSON.parse(savedCart);
        if (Array.isArray(parsed)) setCart(parsed);
      }

      // Check customer session
      const storedCustomer = localStorage.getItem("cb_customer") || localStorage.getItem("cb_user");
      if (storedCustomer) {
        try {
          const parsedCustomer = JSON.parse(storedCustomer);
          if (parsedCustomer.name) setName(parsedCustomer.name);
          if (parsedCustomer.phone || parsedCustomer.mobile) {
            setPhone(parsedCustomer.phone || parsedCustomer.mobile);
          }
          if (parsedCustomer.email) {
            setCustomerEmail(parsedCustomer.email);
            fetchUserAddresses(parsedCustomer.email, parsedCustomer.phone || parsedCustomer.mobile);
          }
        } catch {}
      }

      const savedPin = localStorage.getItem("cb_pincode");
      if (savedPin) {
        setPincode(savedPin);
        const savedCity = localStorage.getItem("cb_city");
        if (savedCity) setCity(savedCity);
      }
    } catch (e) {
      console.error("Failed to load cart", e);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch saved addresses and auto-fill default
  const fetchUserAddresses = async (email?: string, phoneNum?: string) => {
    try {
      const query = email ? `email=${encodeURIComponent(email)}` : `phone=${encodeURIComponent(phoneNum || "")}`;
      const res = await fetch(`/api/customer/addresses?${query}`);
      const data = await res.json();

      if (data.success && Array.isArray(data.addresses) && data.addresses.length > 0) {
        setSavedAddresses(data.addresses);
        const defaultAddr = data.addresses[0];
        setSelectedAddressId(defaultAddr.id);
        setName(defaultAddr.fullName);
        setPhone(defaultAddr.phone);
        setAddress(defaultAddr.street);
        setCity(defaultAddr.city);
        setPincode(defaultAddr.pincode);
      }
    } catch (err) {
      console.error("Failed to fetch user addresses", err);
    }
  };

  // Auto-fetch City & State from Pincode
  const handlePincodeChange = async (val: string) => {
    const cleanPin = val.replace(/\D/g, "").slice(0, 6);
    setPincode(cleanPin);

    if (cleanPin.length === 6) {
      try {
        setFetchingCity(true);
        const res = await fetch(`/api/pincode?code=${cleanPin}`);
        const data = await res.json();
        if (data.success && data.city) {
          setCity(data.city);
          localStorage.setItem("cb_pincode", cleanPin);
          localStorage.setItem("cb_city", data.city);
        }
      } catch (e) {
        console.error("City fetch error:", e);
      } finally {
        setFetchingCity(false);
      }
    }
  };

  const handleSelectAddress = (addr: SavedAddress) => {
    setSelectedAddressId(addr.id);
    setName(addr.fullName);
    setPhone(addr.phone);
    setAddress(addr.street);
    setCity(addr.city);
    setPincode(addr.pincode);
  };

  const handleNewAddressOption = () => {
    setSelectedAddressId("NEW");
    setAddress("");
    setCity("");
  };

  // Pricing calculations
  const shippingCharges = 60; // Standard shipping fee
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const totalMrp = cart.reduce(
    (acc, item) => acc + (item.originalPrice || item.price * 1.4) * item.quantity,
    0
  );
  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const finalTotal = Math.max(1, subtotal + shippingCharges - discountAmount);

  // Abandoned Cart Sync (Fixed to /api/cart/abandoned)
  useEffect(() => {
    if (phone.length >= 10 && cart.length > 0) {
      if (abandonTimeoutRef.current) clearTimeout(abandonTimeoutRef.current);
      abandonTimeoutRef.current = setTimeout(async () => {
        try {
          await fetch("/api/cart/abandoned", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              customerName: name,
              phone: phone,
              city: city,
              pincode: pincode,
              address: address,
              items: cart,
              totalAmount: finalTotal,
            }),
          });
        } catch {}
      }, 1500);
    }
    return () => {
      if (abandonTimeoutRef.current) clearTimeout(abandonTimeoutRef.current);
    };
  }, [name, phone, address, city, pincode, cart, finalTotal]);

  const saveCart = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem("cb_cart", JSON.stringify(newCart));
    window.dispatchEvent(new Event("storage"));
  };

  const updateQuantity = (productId: string, delta: number) => {
    const updated = cart
      .map((item) => {
        if (item.productId === productId) {
          const newQty = item.quantity + delta;
          if (newQty > 9) return item;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      })
      .filter(Boolean) as CartItem[];

    saveCart(updated);
  };

  const removeItem = (productId: string) => {
    const updated = cart.filter((item) => item.productId !== productId);
    saveCart(updated);
  };

  // Apply Coupon Logic
  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError("");

    try {
      const res = await fetch("/api/coupons/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: couponCode.trim().toUpperCase(),
          cartTotal: subtotal + shippingCharges,
        }),
      });

      const data = await res.json();
      if (data.success && data.coupon) {
        setAppliedCoupon({
          code: data.coupon.code,
          discountAmount: data.coupon.discountAmount,
          discountPercent: data.coupon.discountPercent,
        });
        setCouponError("");
      } else {
        setCouponError(data.message || "Invalid or expired coupon code");
      }
    } catch {
      setCouponError("Unable to verify coupon right now");
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError("");
  };

  const createOrderInDb = async (paymentId: string) => {
    // If entered new address, save in background
    if (selectedAddressId === "NEW" && (customerEmail || phone)) {
      try {
        await fetch("/api/customer/addresses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fullName: name,
            phone: phone,
            street: address,
            city: city,
            pincode: pincode,
            userEmail: customerEmail,
            userPhone: phone,
          }),
        });
      } catch {}
    }

    const payload = {
      customer: {
        fullName: name,
        phone: phone,
        addressLine1: address,
        city: city,
        pincode: pincode,
      },
      items: cart.map((i) => ({
        productId: i.productId,
        price: i.price,
        quantity: i.quantity,
        selectedSize: i.selectedSize || null,
        selectedColor: i.selectedColor || null,
      })),
      totalAmount: finalTotal,
      discountAmount: discountAmount,
      shippingCharges: shippingCharges,
      couponCode: appliedCoupon ? appliedCoupon.code : null,
      paymentStatus: "PAID",
      orderStatus: "PROCESSING",
      paymentId: paymentId,
    };

    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    return data?.order?.id || "ORD-" + Math.floor(100000 + Math.random() * 900000);
  };

  const handleOnlinePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    if (!name.trim() || !phone.trim() || !address.trim() || !city.trim() || !pincode.trim()) {
      alert("Please fill all delivery address details.");
      return;
    }

    if (phone.trim().length !== 10) {
      alert("Please enter a valid 10-digit mobile number.");
      return;
    }

    try {
      setProcessingPayment(true);

      const razorpayConstructor = typeof window !== "undefined" ? (window as any).Razorpay : undefined;

      if (!razorpayConstructor) {
        const orderId = await createOrderInDb("pay_online_" + Date.now());
        localStorage.removeItem("cb_cart");
        window.dispatchEvent(new Event("storage"));
        router.push(`/orders?placed=${orderId}`);
        return;
      }

      const options: any = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_placeholder",
        amount: finalTotal * 100,
        currency: "INR",
        name: "CatchBuddy",
        description: `Order for ${cart.length} item(s)`,
        image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=200&q=80",
        prefill: {
          name: name,
          contact: phone,
        },
        theme: {
          color: "#059669",
        },
        handler: async function (response: any) {
          try {
            const placedOrderId = await createOrderInDb(response.razorpay_payment_id);
            localStorage.removeItem("cb_cart");
            window.dispatchEvent(new Event("storage"));
            router.push(`/orders?placed=${placedOrderId}`);
          } catch (err) {
            console.error("Order error:", err);
            router.push("/orders");
          }
        },
        modal: {
          ondismiss: function () {
            setProcessingPayment(false);
          },
        },
      };

      const rzp = new razorpayConstructor(options);
      rzp.on("payment.failed", function (response: any) {
        alert("Payment Failed: " + (response.error?.description || "Transaction cancelled"));
        setProcessingPayment(false);
      });
      rzp.open();
    } catch (err) {
      console.error("Payment error:", err);
      alert("Something went wrong while initiating payment. Please retry.");
      setProcessingPayment(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        <p className="text-xs font-bold text-slate-500">Loading your cart...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 text-slate-900 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-4 sm:px-8 py-3 shadow-xs">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="p-1 hover:bg-slate-100 rounded-lg text-slate-700 inline-flex items-center gap-1 text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4" /> Continue Shopping
          </Link>
          <span className="text-sm font-black text-slate-950">
            Catch<span className="text-emerald-600">Buddy</span> Checkout
          </span>
          <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
            <Lock className="w-3.5 h-3.5" /> 100% Secure
          </span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-8 mt-6">
        {cart.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 shadow-xs">
            <ShoppingBag className="w-14 h-14 text-slate-300 mx-auto" />
            <h2 className="text-lg font-black text-slate-900">Your Cart is Empty</h2>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Add your favourite gadgets and lifestyle products to proceed.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-7 space-y-4">
              {/* Cart Items List */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h1 className="text-sm font-black text-slate-900">
                    Shopping Cart ({cart.length} items)
                  </h1>
                  <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                    Express Doorstep Delivery
                  </span>
                </div>

                <div className="divide-y divide-slate-100">
                  {cart.map((item) => (
                    <div key={item.productId} className="py-3.5 flex gap-3 sm:gap-4">
                      <Image
                        src={item.image}
                        alt={item.title}
                        width={68}
                        height={68}
                        className="w-16 h-16 sm:w-18 sm:h-18 rounded-xl object-cover border border-slate-200 bg-slate-50 shrink-0"
                        unoptimized
                      />
                      <div className="flex-1 flex flex-col justify-between">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <Link
                              href={`/product/${item.slug || item.productId}`}
                              className="text-xs font-bold text-slate-900 hover:text-emerald-700 line-clamp-2"
                            >
                              {item.title}
                            </Link>
                            {(item.selectedSize || item.selectedColor) && (
                              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                                {item.selectedSize && `Size: ${item.selectedSize} `}
                                {item.selectedColor && `• Color: ${item.selectedColor}`}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => removeItem(item.productId)}
                            className="text-slate-400 hover:text-rose-600 p-1 transition"
                            title="Remove"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs sm:text-sm font-black text-slate-950">
                            ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                          </span>
                          <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                            <button
                              onClick={() => updateQuantity(item.productId, -1)}
                              className="p-1.5 hover:bg-slate-200 text-slate-600 transition"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-3 text-xs font-black text-slate-800">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.productId, 1)}
                              disabled={item.quantity >= 9}
                              className="p-1.5 hover:bg-slate-200 disabled:opacity-40 text-slate-600 transition"
                              title={item.quantity >= 9 ? "Maximum 9 allowed" : "Add one"}
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Address Section */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" /> Delivery Address
                  </h2>
                  <span className="text-[10px] font-bold text-slate-400">Step 1 of 2</span>
                </div>

                {/* Saved Addresses Selector */}
                {savedAddresses.length > 0 && (
                  <div className="space-y-2 mb-3">
                    <p className="text-[11px] font-bold text-slate-500">Select Delivery Location:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {savedAddresses.map((addr) => {
                        const isSelected = selectedAddressId === addr.id;
                        return (
                          <div
                            key={addr.id}
                            onClick={() => handleSelectAddress(addr)}
                            className={`p-3 rounded-xl border text-xs cursor-pointer transition ${
                              isSelected
                                ? "border-emerald-600 bg-emerald-50/50 shadow-2xs"
                                : "border-slate-200 hover:border-slate-300 bg-white"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-900 truncate">{addr.fullName}</span>
                              {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                            </div>
                            <p className="text-slate-500 text-[11px] line-clamp-1 mt-0.5">
                              {addr.street}, {addr.city}
                            </p>
                            <p className="text-slate-700 font-semibold text-[10px] mt-0.5">
                              PIN: {addr.pincode} • 📞 {addr.phone}
                            </p>
                          </div>
                        );
                      })}
                    </div>

                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={handleNewAddressOption}
                        className={`text-xs font-bold underline cursor-pointer ${
                          selectedAddressId === "NEW"
                            ? "text-emerald-700 font-black"
                            : "text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        + Enter Different / New Address
                      </button>
                    </div>
                  </div>
                )}

                {/* Address Form Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Full Name *"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-emerald-600"
                  />
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                    placeholder="Mobile Number (10 digits) *"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-emerald-600"
                  />
                </div>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="House No, Building, Street / Colony *"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-emerald-600"
                />
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="City / District *"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-emerald-600"
                    />
                    {fetchingCity && (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600 absolute right-3 top-1/2 -translate-y-1/2" />
                    )}
                  </div>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={pincode}
                    onChange={(e) => handlePincodeChange(e.target.value)}
                    placeholder="Pincode (6 digits) *"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-emerald-600"
                  />
                </div>
              </div>
            </div>

            {/* Right Summary Column */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-emerald-600 text-white rounded-2xl p-4 sm:p-5 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-100">
                    PAYMENT METHOD
                  </span>
                  <span className="bg-white/20 text-white text-[10px] font-black px-2 py-0.5 rounded-md backdrop-blur-xs">
                    Prepaid Only
                  </span>
                </div>
                <div className="flex items-center gap-3 pt-1">
                  <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                    <CreditCard className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-white">Instant Online Payment</h3>
                    <p className="text-[11px] text-emerald-100 font-medium">
                      UPI (GPay, PhonePe, Paytm), Cards &amp; NetBanking
                    </p>
                  </div>
                </div>
              </div>

              {/* Coupon Section */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-emerald-600" /> Coupon
                  </span>
                  {appliedCoupon && (
                    <button
                      onClick={removeCoupon}
                      className="text-[11px] text-rose-600 font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
                    >
                      <X className="w-3 h-3" /> Remove
                    </button>
                  )}
                </div>

                {!appliedCoupon ? (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="Enter Coupon Code"
                      className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold uppercase tracking-wider outline-none focus:border-emerald-600"
                    />
                    <button
                      type="submit"
                      disabled={couponLoading || !couponCode.trim()}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-black rounded-xl transition cursor-pointer"
                    >
                      {couponLoading ? "..." : "Apply"}
                    </button>
                  </form>
                ) : (
                  <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl flex items-center justify-between text-xs font-bold text-emerald-900">
                    <span className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-600" /> Coupon &apos;{appliedCoupon.code}&apos; applied!
                    </span>
                    <span className="text-emerald-700">- ₹{appliedCoupon.discountAmount}</span>
                  </div>
                )}

                {couponError && (
                  <p className="text-[11px] font-bold text-rose-600 mt-1">{couponError}</p>
                )}
              </div>

              {/* Order Summary */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-2xs space-y-3">
                <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  Order Summary
                </h2>

                <div className="space-y-2 text-xs font-semibold text-slate-600">
                  <div className="flex justify-between">
                    <span>Total MRP</span>
                    <span className="line-through text-slate-400">₹{totalMrp.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Store Price</span>
                    <span className="text-slate-900 font-bold">₹{subtotal.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Shipping Charges</span>
                    <span className="text-slate-900 font-bold">₹{shippingCharges}</span>
                  </div>
                  {appliedCoupon && (
                    <div className="flex justify-between text-emerald-600 font-bold">
                      <span>Coupon Discount ({appliedCoupon.code})</span>
                      <span>- ₹{appliedCoupon.discountAmount.toLocaleString("en-IN")}</span>
                    </div>
                  )}
                  <div className="pt-2.5 border-t border-slate-100 flex justify-between items-center text-sm font-black text-slate-950">
                    <span>Total Payable</span>
                    <span className="text-emerald-600 text-base">₹{finalTotal.toLocaleString("en-IN")}</span>
                  </div>
                </div>

                <button
                  onClick={handleOnlinePayment}
                  disabled={processingPayment}
                  className="w-full mt-3 py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-black transition flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                >
                  {processingPayment ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Processing Payment...
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5" /> Pay Now ₹{finalTotal.toLocaleString("en-IN")}
                    </>
                  )}
                </button>

                <div className="pt-2 flex items-center justify-center gap-4 text-[10px] font-bold text-slate-400">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> 256-bit Encrypted
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Instant Refund Guarantee
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}