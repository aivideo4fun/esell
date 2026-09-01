"use client";

import { useState, useRef, useEffect } from "react";
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
  ChevronDown
} from "lucide-react";

export default function CustomerDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    // Clear session / cookies logic
    setIsOpen(false);
    window.location.href = "/";
  };

  const menuItems = [
    { label: "My Profile", href: "/account", icon: User },
    { label: "My Orders", href: "/orders", icon: Package },
    { label: "Track Order", href: "/orders/track", icon: Truck },
    { label: "Wishlist", href: "/wishlist", icon: Heart },
    { label: "Saved Addresses", href: "/account/addresses", icon: MapPin },
    { label: "Coupons", href: "/account/coupons", icon: TicketPercent },
    { label: "Notifications", href: "/account/notifications", icon: Bell },
    { label: "Help & Support", href: "/contact", icon: HelpCircle },
  ];

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-2 text-slate-700 hover:text-emerald-600 rounded-xl hover:bg-slate-100 transition cursor-pointer"
      >
        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs border border-emerald-200">
          CB
        </div>
        <span className="text-xs font-bold hidden sm:inline-block">My Account</span>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl border border-slate-200 shadow-xl py-2 z-50 text-xs animate-in fade-in slide-in-from-top-2 duration-150">
          {/* User Info Header */}
          <div className="px-4 py-2.5 border-b border-slate-100">
            <p className="font-bold text-slate-900 truncate">CatchBuddy Customer</p>
            <p className="text-[11px] text-slate-400 truncate">customer@example.com</p>
          </div>

          {/* Links List */}
          <div className="py-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 hover:bg-slate-50 text-slate-700 font-medium transition"
                >
                  <Icon className="w-4 h-4 text-slate-400" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Logout Action */}
          <div className="border-t border-slate-100 pt-1">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-4 py-2 text-rose-600 hover:bg-rose-50 font-semibold transition cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}