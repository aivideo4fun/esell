/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, ShoppingBag, User, Package, MapPin, Edit2, X, Check, Navigation, Loader2 } from "lucide-react";

export default function Header({ onSearch }: { onSearch?: (query: string) => void }) {
  const router = useRouter();
  const [cartCount, setCartCount] = useState(0);
  const [userName, setUserName] = useState<string | null>(null);
  const [searchVal, setSearchVal] = useState("");
  
  // Real Pincode & City State from localStorage
  const [pincode, setPincode] = useState("341512");
  const [cityName, setCityName] = useState("Nagaur");
  const [showPincodeModal, setShowPincodeModal] = useState(false);
  const [tempPincode, setTempPincode] = useState("");
  const [tempCity, setTempCity] = useState("");
  const [detectingGps, setDetectingGps] = useState(false);

  // Sync cart count, user session & pincode from localStorage
  useEffect(() => {
    const updateHeaderState = () => {
      try {
        const savedCart = localStorage.getItem("cb_cart");
        if (savedCart) {
          const parsed = JSON.parse(savedCart);
          if (Array.isArray(parsed)) {
            const totalQty = parsed.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0);
            setCartCount(totalQty);
          } else {
            setCartCount(0);
          }
        } else {
          setCartCount(0);
        }

        const userSession = localStorage.getItem("cb_user") || localStorage.getItem("user");
        if (userSession) {
          const userData = JSON.parse(userSession);
          if (userData?.name) {
            setUserName(userData.name);
          } else if (typeof userData === "string") {
            setUserName(userData);
          }
        }

        const savedPin = localStorage.getItem("cb_pincode");
        const savedCity = localStorage.getItem("cb_city");
        if (savedPin) setPincode(savedPin);
        if (savedCity) setCityName(savedCity);
      } catch (e) {
        console.error(e);
      }
    };

    updateHeaderState();
    window.addEventListener("storage", updateHeaderState);
    const interval = setInterval(updateHeaderState, 400);
    return () => {
      window.removeEventListener("storage", updateHeaderState);
      clearInterval(interval);
    };
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchVal(val);
    if (onSearch) {
      onSearch(val);
    }
  };

  const handleSavePincode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempPincode || tempPincode.length < 6) {
      alert("Kripya valid 6-digit pincode enter karein.");
      return;
    }

    const finalPin = tempPincode.trim();
    const finalCity = tempCity.trim() || "Location";

    setPincode(finalPin);
    setCityName(finalCity);

    localStorage.setItem("cb_pincode", finalPin);
    localStorage.setItem("cb_city", finalCity);

    setShowPincodeModal(false);
    window.dispatchEvent(new Event("storage"));
  };

  // GPS Live Location Detection Function
  const detectGpsLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setDetectingGps(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;

          // Fetch real address from OpenStreetMap Nominatim API
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
          const data = await res.json();

          if (data && data.address) {
            const detectedCity = data.address.city || data.address.town || data.address.village || data.address.state_district || "My City";
            const detectedPin = data.address.postcode || "341512";

            setTempPincode(detectedPin);
            setTempCity(detectedCity);
          } else {
            alert("Could not determine exact address from GPS.");
          }
        } catch (err) {
          console.error("GPS Fetch Error:", err);
          alert("Failed to fetch location details.");
        } finally {
          setDetectingGps(false);
        }
      },
      (error) => {
        console.error(error);
        alert("Location permission denied or unavailable.");
        setDetectingGps(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  return (
    <>
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        {/* Main Navbar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <img
              src="/logo.png"
              alt="CatchBuddy Logo"
              className="h-10 w-auto object-contain group-hover:scale-105 transition"
            />
            <span className="text-xl font-black tracking-tight text-slate-950">
              Catch<span className="text-emerald-600">Buddy</span>
            </span>
          </Link>

          {/* Central Search Bar */}
          <div className="flex-1 max-w-2xl hidden md:block">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchVal}
                onChange={handleSearchChange}
                placeholder="Search gadgets, home utilities, electronics..."
                className="w-full pl-11 pr-4 py-3 bg-slate-50/80 hover:bg-slate-50 border border-slate-200 focus:border-emerald-600 rounded-2xl text-xs font-semibold text-slate-900 outline-none transition shadow-2xs"
              />
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-5 shrink-0">
            <Link
              href="/orders"
              className="hidden sm:flex items-center gap-1.5 text-xs font-black text-slate-800 hover:text-emerald-600 transition"
            >
              <Package className="w-4 h-4 text-slate-500" /> My Orders
            </Link>

            <Link
              href={userName ? "/account" : "/login"}
              className="flex items-center gap-1.5 text-xs font-black text-slate-800 hover:text-emerald-600 transition bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl"
            >
              <User className="w-4 h-4 text-emerald-600" />
              <span className="max-w-[100px] truncate">{userName ? userName : "Account"}</span>
            </Link>

            <Link
              href="/cart"
              className="relative p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl text-slate-800 transition flex items-center justify-center cursor-pointer shadow-2xs"
            >
              <ShoppingBag className="w-5 h-5 text-slate-800" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-emerald-600 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Sub-bar: Interactive Delivery Pincode */}
        <div className="bg-[#f0fdf4]/60 border-t border-emerald-100 px-4 sm:px-8 py-2 text-xs">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <button
              onClick={() => {
                setTempPincode(pincode);
                setTempCity(cityName);
                setShowPincodeModal(true);
              }}
              className="flex items-center gap-2 text-slate-800 font-bold hover:text-emerald-700 transition cursor-pointer group"
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-600 group-hover:scale-110 transition" />
              <span>Delivering to: <b className="text-slate-950 underline decoration-dotted ml-0.5">{pincode}</b></span>
              <span className="text-emerald-700 font-black ml-1 bg-emerald-100/70 px-2 py-0.5 rounded-md flex items-center gap-1">
                {cityName} <Edit2 className="w-3 h-3 text-emerald-600" />
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Pincode & GPS Location Modal */}
      {showPincodeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setShowPincodeModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-700 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto border border-emerald-200">
              <MapPin className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="text-lg font-black text-slate-950">Choose Delivery Location</h3>
              <p className="text-xs text-slate-500 mt-0.5">Use GPS live location or enter your pincode manually.</p>
            </div>

            {/* GPS Detect Button */}
            <button
              type="button"
              onClick={detectGpsLocation}
              disabled={detectingGps}
              className="w-full py-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-black rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
            >
              {detectingGps ? <Loader2 className="w-4 h-4 animate-spin text-emerald-600" /> : <Navigation className="w-4 h-4 text-emerald-600" />}
              {detectingGps ? "Detecting GPS Location..." : "Detect My Live GPS Location"}
            </button>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-slate-200"></div>
              <span className="flex-shrink mx-4 text-slate-400 text-[10px] font-bold uppercase">or enter manually</span>
              <div className="flex-grow border-t border-slate-200"></div>
            </div>

            <form onSubmit={handleSavePincode} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Pincode (6 digits)</label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  placeholder="e.g. 341512"
                  value={tempPincode}
                  onChange={(e) => setTempPincode(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">City / Area Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Nagaur / Udaipur"
                  value={tempCity}
                  onChange={(e) => setTempCity(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-emerald-600"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <Check className="w-4 h-4" /> Apply Location
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}