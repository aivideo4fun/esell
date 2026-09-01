"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  // Overview
  LayoutDashboard,
  // Commerce
  ShoppingCart,
  Package,
  Layers,
  Boxes,
  Truck,
  RotateCcw,
  Building2,
  // Customers & Marketing
  Users,
  ShoppingBag,
  TicketPercent,
  Megaphone,
  Star,
  Bell,
  // Content
  Image as ImageIcon,
  BookOpen,
  FileText,
  Search,
  HelpCircle,
  // Finance
  CreditCard,
  Receipt,
  Wallet,
  Coins,
  TrendingUp,
  // Analytics
  BarChart3,
  LineChart,
  PieChart,
  FileSpreadsheet,
  // Support
  LifeBuoy,
  MessageSquare,
  Ticket,
  // System
  UserCog,
  ShieldCheck,
  History,
  Settings as SettingsIcon,
  Cpu,
  // Layout
  ArrowLeft,
  LogOut,
  Loader2,
  ChevronRight,
  ExternalLink
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
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
        <p className="text-xs font-bold text-slate-400">Verifying Admin Access...</p>
      </div>
    );
  }

  const navSections = [
    {
      title: "OVERVIEW",
      items: [
        { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
      ],
    },
    {
      title: "COMMERCE",
      items: [
        { label: "Orders & Fulfillment", href: "/admin/orders", icon: ShoppingCart },
        { label: "Products Catalog", href: "/admin/products", icon: Package },
        { label: "Categories", href: "/admin/categories", icon: Layers },
        { label: "Stock & Inventory", href: "/admin/inventory", icon: Boxes },
        { label: "Suppliers", href: "/admin/suppliers", icon: Building2 },
        { label: "Shipping & Delivery", href: "/admin/shipping", icon: Truck },
        { label: "Returns & Refunds", href: "/admin/returns", icon: RotateCcw },
      ],
    },
    {
      title: "CUSTOMERS & MARKETING",
      items: [
        { label: "Customers (CRM)", href: "/admin/customers", icon: Users },
        { label: "Abandoned Carts", href: "/admin/abandoned-carts", icon: ShoppingBag },
        { label: "Coupons & Offers", href: "/admin/coupons", icon: TicketPercent },
        { label: "Marketing Campaigns", href: "/admin/campaigns", icon: Megaphone },
        { label: "Reviews & Ratings", href: "/admin/reviews", icon: Star },
        { label: "Notifications", href: "/admin/notifications", icon: Bell },
      ],
    },
    {
      title: "CONTENT",
      items: [
        { label: "Banners & CMS", href: "/admin/banners", icon: ImageIcon },
        { label: "Blog", href: "/admin/blog", icon: BookOpen },
        { label: "Pages", href: "/admin/pages", icon: FileText },
        { label: "SEO Manager", href: "/admin/seo", icon: Search },
        { label: "FAQ", href: "/admin/faq", icon: HelpCircle },
      ],
    },
    {
      title: "FINANCE",
      items: [
        { label: "Payments & Transactions", href: "/admin/payments", icon: CreditCard },
        { label: "Refunds", href: "/admin/finance-refunds", icon: Receipt },
        { label: "Supplier Payouts", href: "/admin/payouts", icon: Wallet },
        { label: "Expenses", href: "/admin/expenses", icon: Coins },
        { label: "Revenue", href: "/admin/revenue", icon: TrendingUp },
      ],
    },
    {
      title: "ANALYTICS",
      items: [
        { label: "Sales Analytics", href: "/admin/analytics", icon: BarChart3 },
        { label: "Product Analytics", href: "/admin/analytics/products", icon: LineChart },
        { label: "Customer Analytics", href: "/admin/analytics/customers", icon: PieChart },
        { label: "Reports", href: "/admin/reports", icon: FileSpreadsheet },
      ],
    },
    {
      title: "SUPPORT",
      items: [
        { label: "Support Desk", href: "/admin/tickets", icon: LifeBuoy },
        { label: "Tickets", href: "/admin/tickets/list", icon: Ticket },
        { label: "Customer Messages", href: "/admin/messages", icon: MessageSquare },
      ],
    },
    {
      title: "SYSTEM",
      items: [
        { label: "Admin Users", href: "/admin/users", icon: UserCog },
        { label: "Roles & Permissions", href: "/admin/roles", icon: ShieldCheck },
        { label: "Activity Logs", href: "/admin/logs", icon: History },
        { label: "Store Settings", href: "/admin/settings", icon: SettingsIcon },
        { label: "Integrations", href: "/admin/integrations", icon: Cpu },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row text-slate-900 antialiased selection:bg-emerald-500 selection:text-white">
      {/* Sidebar */}
      <aside className="w-full md:w-72 bg-slate-950 text-slate-300 flex flex-col justify-between shrink-0 md:sticky md:top-0 md:h-screen overflow-y-auto border-r border-slate-800">
        <div>
          {/* Header */}
          <div className="p-5 border-b border-slate-800/80 bg-slate-950/60 sticky top-0 z-10 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center font-black text-white text-xs shadow-lg shadow-emerald-900/40">
                CB
              </div>
              <div>
                <h2 className="text-sm font-black tracking-wider text-white uppercase">
                  CatchBuddy Admin
                </h2>
                <p className="text-[10px] text-emerald-400 font-semibold tracking-widest uppercase">
                  Enterprise Control Hub
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Sections */}
          <nav className="p-3.5 space-y-6">
            {navSections.map((section, sIdx) => (
              <div key={sIdx} className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-500 px-3 pb-1">
                  {section.title}
                </p>
                <div className="space-y-0.5">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all group ${
                          isActive
                            ? "bg-emerald-600 text-white font-bold shadow-sm shadow-emerald-950/50"
                            : "text-slate-400 hover:bg-slate-900/80 hover:text-slate-100"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {Icon && (
                            <Icon
                              className={`w-4 h-4 shrink-0 transition-colors ${
                                isActive
                                  ? "text-white"
                                  : "text-slate-400 group-hover:text-emerald-400"
                              }`}
                            />
                          )}
                          <span className="truncate">{item.label}</span>
                        </div>
                        {isActive && (
                          <ChevronRight className="w-3.5 h-3.5 text-white/80 shrink-0" />
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40 space-y-2 sticky bottom-0 backdrop-blur-md">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3.5 py-2.5 text-xs font-bold text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-900 border border-slate-800 rounded-xl transition group"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5 text-emerald-400" /> View Live Store
            </span>
            <span className="text-[10px] text-slate-500 group-hover:text-slate-400 font-normal">↗</span>
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 rounded-xl transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" /> Logout Session
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 p-6 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}