"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, ShoppingBag, Search, Package, User } from "lucide-react";

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  // Admin panel par bottom bar na dikhe
  if (pathname.startsWith("/admin")) {
    return null;
  }

  const handleSearchClick = () => {
    // Agar home page par hain toh direct top search bar ko scroll & focus karein
    const searchInput = document.querySelector<HTMLInputElement>(
      'input[placeholder*="Search"]'
    );

    if (searchInput) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      setTimeout(() => {
        searchInput.focus();
      }, 300);
    } else {
      router.push("/shop");
    }
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 py-2 flex items-center justify-around shadow-lg">
      <Link
        href="/"
        className={`flex flex-col items-center gap-0.5 text-[10px] font-bold transition ${
          pathname === "/" ? "text-[#16a34a]" : "text-slate-500 hover:text-slate-800"
        }`}
      >
        <Home className="w-5 h-5" />
        <span>Home</span>
      </Link>

      <Link
        href="/shop"
        className={`flex flex-col items-center gap-0.5 text-[10px] font-bold transition ${
          pathname === "/shop" ? "text-[#16a34a]" : "text-slate-500 hover:text-slate-800"
        }`}
      >
        <ShoppingBag className="w-5 h-5" />
        <span>Shop</span>
      </Link>

      {/* Working Search Button */}
      <button
        type="button"
        onClick={handleSearchClick}
        className="flex flex-col items-center gap-0.5 text-[10px] font-bold text-slate-500 hover:text-[#16a34a] transition cursor-pointer"
      >
        <Search className="w-5 h-5" />
        <span>Search</span>
      </button>

      <Link
        href="/account"
        className={`flex flex-col items-center gap-0.5 text-[10px] font-bold transition ${
          pathname.includes("order") ? "text-[#16a34a]" : "text-slate-500 hover:text-slate-800"
        }`}
      >
        <Package className="w-5 h-5" />
        <span>Orders</span>
      </Link>

      <Link
        href="/account"
        className={`flex flex-col items-center gap-0.5 text-[10px] font-bold transition ${
          pathname === "/account" || pathname === "/login"
            ? "text-[#16a34a]"
            : "text-slate-500 hover:text-slate-800"
        }`}
      >
        <User className="w-5 h-5" />
        <span>Login</span>
      </Link>
    </nav>
  );
}