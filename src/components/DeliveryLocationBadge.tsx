"use client";

import { useState, useEffect } from "react";
import { MapPin, Navigation, ChevronDown, X, Loader2, Check } from "lucide-react";

export default function DeliveryLocationBadge() {
  const [pincode, setPincode] = useState("341512");
  const [city, setCity] = useState("Locating...");
  const [isOpen, setIsOpen] = useState(false);
  const [inputPin, setInputPin] = useState("");
  const [gpsLoading, setGpsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Auto fetch City from Pincode
  const resolvePincode = async (code: string) => {
    try {
      const res = await fetch(`/api/pincode?code=${code}`);
      const data = await res.json();
      if (data.success && data.city) {
        setCity(data.city);
        localStorage.setItem("cb_city", data.city);
        localStorage.setItem("cb_pincode", code);
      } else {
        setCity("India");
      }
    } catch {
      setCity("India");
    }
  };

  useEffect(() => {
    const savedPin = localStorage.getItem("cb_pincode") || "341512";
    const savedCity = localStorage.getItem("cb_city");

    setPincode(savedPin);
    if (savedCity) {
      setCity(savedCity);
    } else {
      resolvePincode(savedPin);
    }
  }, []);

  // GPS Auto Fetch
  const handleUseGps = () => {
    if (!navigator.geolocation) {
      setErrorMsg("GPS is not supported on this browser.");
      return;
    }

    setGpsLoading(true);
    setErrorMsg("");

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(`/api/location/gps?lat=${latitude}&lng=${longitude}`);
          const data = await res.json();

          if (data.success && data.pincode) {
            setPincode(data.pincode);
            setCity(data.city);
            localStorage.setItem("cb_pincode", data.pincode);
            localStorage.setItem("cb_city", data.city);
            setIsOpen(false);
          } else {
            setErrorMsg("Could not detect exact location. Please type pincode.");
          }
        } catch {
          setErrorMsg("Failed to resolve GPS coordinates.");
        } finally {
          setGpsLoading(false);
        }
      },
      (err) => {
        setGpsLoading(false);
        if (err.code === err.PERMISSION_DENIED) {
          setErrorMsg("Location permission denied. Please allow GPS or enter pincode manually.");
        } else {
          setErrorMsg("Location detection timed out.");
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Manual Pincode Submit
  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPin = inputPin.replace(/\D/g, "").slice(0, 6);
    if (cleanPin.length !== 6) {
      setErrorMsg("Please enter a valid 6-digit pincode.");
      return;
    }

    try {
      const res = await fetch(`/api/pincode?code=${cleanPin}`);
      const data = await res.json();
      if (data.success && data.city) {
        setPincode(cleanPin);
        setCity(data.city);
        localStorage.setItem("cb_pincode", cleanPin);
        localStorage.setItem("cb_city", data.city);
        setIsOpen(false);
        setInputPin("");
        setErrorMsg("");
      } else {
        setErrorMsg("Invalid pincode entered.");
      }
    } catch {
      setErrorMsg("Error validating pincode.");
    }
  };

  return (
    <>
      {/* Navbar Badge: Pincode ke niche City */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 text-left group hover:opacity-85 transition cursor-pointer"
      >
        <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0 self-start mt-0.5" />
        <div className="flex flex-col leading-tight">
          <div className="flex items-center gap-1">
            <span className="text-[11px] text-slate-500 font-medium">Delivering to:</span>
            <span className="text-xs font-black text-slate-900 font-mono tracking-tight">
              {pincode}
            </span>
            <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-slate-700 transition" />
          </div>
          {/* Pincode ke theek niche City */}
          <span className="text-[10px] font-bold text-emerald-700 line-clamp-1 max-w-[130px]">
            {city}
          </span>
        </div>
      </button>

      {/* GPS & Pincode Picker Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full border border-slate-200 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-slate-950">Choose Delivery Location</h3>
                <p className="text-[11px] text-slate-500 font-medium">
                  Fastest delivery options are based on your area.
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* GPS Auto-Detect Button */}
            <button
              type="button"
              onClick={handleUseGps}
              disabled={gpsLoading}
              className="w-full py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100/70 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
            >
              {gpsLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                  Detecting current GPS location...
                </>
              ) : (
                <>
                  <Navigation className="w-3.5 h-3.5 text-emerald-600" />
                  Use Current Location (GPS)
                </>
              )}
            </button>

            <div className="flex items-center gap-2 text-slate-300">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-[10px] uppercase font-bold text-slate-400">or enter pincode</span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>

            {/* Manual Pincode Form */}
            <form onSubmit={handleManualSubmit} className="flex gap-2">
              <input
                type="text"
                maxLength={6}
                placeholder="Enter 6-digit pincode"
                value={inputPin}
                onChange={(e) => setInputPin(e.target.value.replace(/\D/g, ""))}
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-emerald-600"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black rounded-xl transition cursor-pointer"
              >
                Apply
              </button>
            </form>

            {errorMsg && (
              <p className="text-[11px] font-bold text-rose-600">{errorMsg}</p>
            )}
          </div>
        </div>
      )}
    </>
  );
}