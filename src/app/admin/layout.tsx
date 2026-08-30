"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Package, 
  ShoppingCart, 
  ArrowLeft, 
  LayoutDashboard, 
  LogOut, 
  Loader2, 
  ShieldCheck 
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
      } catch (err) {
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

  // Login page par sidebar nahi dikhana
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Auth checking loader
  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="text-xs font-bold text-gray-700">Verifying Admin Access...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-gray-950 text-white p-6 flex flex-col justify-between shrink-0">
        <div className="space-y-8">
          <div>
            <span className="text-[10px] font-bold tracking-widest text-blue-400 uppercase flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Management Hub
            </span>
            <h2 className="text-xl font-black text-white">CatchBuddy Admin</h2>
          </div>

          <nav className="space-y-2">
            <Link
              href="/admin/products"
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                pathname === "/admin/products"
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <Package className="w-4 h-4 text-purple-400" /> Product Inventory
            </Link>

            <Link
              href="/admin/orders"
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                pathname === "/admin/orders"
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <ShoppingCart className="w-4 h-4 text-green-400" /> Orders &amp; Fulfillment
            </Link>
          </nav>
        </div>

        <div className="pt-6 border-t border-gray-800 space-y-3">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" /> View Live Store
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
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}