"use client";

import { useState, useEffect } from "react";

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

  useEffect(() => {
    const saved = localStorage.getItem("cb_wishlist");
    if (saved) {
      try {
        setWishlist(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse wishlist", e);
      }
    }

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
  }, []);

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