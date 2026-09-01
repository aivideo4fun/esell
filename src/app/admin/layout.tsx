"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Layers,
  Users,
  Boxes,
  TicketPercent,
  CreditCard,
  Star,
  Image as ImageIcon,
  BarChart3,
  LifeBuoy,
  Settings as SettingsIcon,
  ArrowLeft,
  LogOut,
  Loader2,
  ShieldCheck,
  ChevronRight
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);

  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (isLoginPage) {
      setCheckingAuth(false);
      return;
    }

    const verifyAdmin = async () => {
      try {
        const res = await fetch("/api/admin/auth");
        const data = await res.json();
        if (!data.authenticated) {
          router.push("/admin/login");
        } else {
          setCheckingAuth(false);
        }
      } catch {
        router.push("/admin/login");
      }
    };

    verifyAdmin();
  }, [pathname, isLoginPage, router]);

  const handleLogout = async () => {
    await fetch("/api/admin/auth", { method: "DELETE" });
    router.push("/admin/login");
    router.refresh();
  };

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
        <p className="text-xs font-bold text-gray-400">Verifying Admin Access...</p>
      </div>
    );
  }

  const navSections = [
    {
      title: "Core Commerce",
      items: [
        { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
        { label: "Orders & Fulfillment", href: "/admin/orders", icon: ShoppingCart },
        { label: "Products Catalog", href: "/admin/products", icon: Package },
        { label: "Categories Tree", href: "/admin/categories", icon: Layers },
        { label: "Stock & Inventory", href: "/admin/inventory", icon: Boxes },
      ],
    },
    {
      title: "Marketing & Relations",
      items: [
        { label: "Coupons & Offers", href: "/admin/coupons", icon: TicketPercent },
        { label: "Customers (CRM)", href: "/admin/customers", icon: Users },
        { label: "Reviews & Ratings", href: "/admin/reviews", icon: Star },
        { label: "Banners (CMS)", href: "/admin/banners", icon: ImageIcon },
        { label: "Support Desk", href: "/admin/tickets", icon: LifeBuoy },
      ],
    },
    {
      title: "Finance & System",
      items: [
        { label: "Payments & Txns", href: "/admin/payments", icon: CreditCard },
        { label: "Reports & Analytics", href: "/admin/analytics", icon: BarChart3 },
        { label: "Store Settings", href: "/admin/settings", icon: SettingsIcon },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row text-slate-900">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-gray-950 text-white p-5 flex flex-col justify-between shrink-0 md:sticky md:top-0 md:h-screen overflow-y-auto border-r border-gray-800">
        <div className="space-y-6">
          
          {/* Brand Header */}
          <div className="pb-3 border-b border-gray-800">
            <span className="text-[10px] font-bold tracking-widest text-emerald-400 uppercase flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Management Hub
            </span>
            <h2 className="text-lg font-black text-white mt-1">CatchBuddy Admin</h2>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-4">
            {navSections.map((section, sIdx) => (
              <div key={sIdx} className="space-y-1.5">
                <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 px-3">
                  {section.title}
                </p>
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition ${
                          isActive
                            ? "bg-emerald-600 text-white shadow-md font-bold"
                            : "text-gray-300 hover:bg-gray-800 hover:text-white"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-emerald-400"}`} />
                          <span>{item.label}</span>
                        </div>
                        {isActive && <ChevronRight className="w-3.5 h-3.5 text-white/80" />}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Footer Links */}
        <div className="pt-4 mt-6 border-t border-gray-800 space-y-2">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-gray-400 hover:text-white hover:bg-gray-800/60 rounded-xl transition"
          >
            <ArrowLeft className="w-4 h-4 text-emerald-400" /> View Live Store
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-red-400 hover:text-white hover:bg-red-600/20 rounded-xl transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" /> Logout Session
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}