"use client";

import { useState, useEffect, useCallback } from "react";

export interface WishlistItem {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  image: string;
  slug?: string;
}

export function useWishlist() {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);

  // Function to sync with live DB products
  const syncWithLiveProducts = useCallback(async (currentWishlist: WishlistItem[]) => {
    if (currentWishlist.length === 0) return;

    try {
      const res = await fetch("/api/products", { cache: "no-store" });
      const data = await res.json();
      const liveProducts = data.products || (Array.isArray(data) ? data : []);
      const liveIds = new Set(liveProducts.map((p: any) => p.id));

      // Filter out items that are deleted from DB
      const validItems = currentWishlist.filter((item) => liveIds.has(item.id));

      // If ghost/deleted products were present, update localStorage and state
      if (validItems.length !== currentWishlist.length) {
        localStorage.setItem("cb_wishlist", JSON.stringify(validItems));
        setWishlist(validItems);
        window.dispatchEvent(new Event("wishlist-updated"));
      }
    } catch (err) {
      console.error("Failed to sync wishlist with live catalog", err);
    }
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("cb_wishlist");
    let initialList: WishlistItem[] = [];

    if (saved) {
      try {
        initialList = JSON.parse(saved);
        setWishlist(initialList);
      } catch (e) {
        console.error("Failed to parse wishlist", e);
      }
    }

    // Auto-verify with DB
    void syncWithLiveProducts(initialList);

    const handleStorageChange = () => {
      const updated = localStorage.getItem("cb_wishlist");
      if (updated) {
        try {
          setWishlist(JSON.parse(updated));
        } catch {}
      } else {
        setWishlist([]);
      }
    };

    window.addEventListener("wishlist-updated", handleStorageChange);
    return () => window.removeEventListener("wishlist-updated", handleStorageChange);
  }, [syncWithLiveProducts]);

  const toggleWishlist = (item: WishlistItem) => {
    setWishlist((prev) => {
      const exists = prev.some((p) => p.id === item.id);
      let updated: WishlistItem[];
      if (exists) {
        updated = prev.filter((p) => p.id !== item.id);
      } else {
        updated = [...prev, item];
      }
      localStorage.setItem("cb_wishlist", JSON.stringify(updated));
      window.dispatchEvent(new Event("wishlist-updated"));
      return updated;
    });
  };

  const isInWishlist = (id: string) => wishlist.some((item) => item.id === id);

  return { wishlist, toggleWishlist, isInWishlist };
}