"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface CartItem {
  id: string;
  title: string;
  price: number;
  image?: string;
  quantity: number;
  size?: string;
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  addItem: (product: Omit<CartItem, "quantity"> & { quantity?: number }) => boolean;
  removeItem: (id: string, size?: string) => void;
  updateQuantity: (id: string, quantity: number, size?: string) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
  syncWithLiveCatalog: () => Promise<void>;
}

const MAX_UNIQUE_PRODUCTS = 20;
const MAX_ITEM_QUANTITY = 9;

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      // Live catalog verification: DB se deleted products ko cart se remove karta hai
      syncWithLiveCatalog: async () => {
        const currentItems = get().items;
        if (currentItems.length === 0) return;

        try {
          const res = await fetch("/api/products", { cache: "no-store" });
          const data = await res.json();
          const liveProducts = data.products || (Array.isArray(data) ? data : []);
          const liveIds = new Set(liveProducts.map((p: any) => p.id));

          const validItems = currentItems.filter((item) => liveIds.has(item.id));
          if (validItems.length !== currentItems.length) {
            set({ items: validItems });
          }
        } catch {
          // silent fallback on network errors
        }
      },

      addItem: (product) => {
        const currentItems = get().items;
        const targetSize = product.size || "Standard";

        const existingIndex = currentItems.findIndex(
          (item) => item.id === product.id && (item.size || "Standard") === targetSize
        );

        if (existingIndex > -1) {
          const existingItem = currentItems[existingIndex];
          const newQty = existingItem.quantity + (product.quantity || 1);

          if (newQty > MAX_ITEM_QUANTITY) {
            alert(`Aap ek product ki maximum ${MAX_ITEM_QUANTITY} units hi order kar sakte hain.`);
            return false;
          }

          const updatedItems = [...currentItems];
          updatedItems[existingIndex] = {
            ...existingItem,
            quantity: newQty,
          };

          set({ items: updatedItems });
          return true;
        }

        if (currentItems.length >= MAX_UNIQUE_PRODUCTS) {
          alert(`Aap cart mein maximum ${MAX_UNIQUE_PRODUCTS} alag-alag products hi add kar sakte hain.`);
          return false;
        }

        const initialQty = Math.min(product.quantity || 1, MAX_ITEM_QUANTITY);
        set({
          items: [
            ...currentItems,
            {
              id: product.id,
              title: product.title,
              price: product.price,
              image: product.image,
              quantity: initialQty,
              size: targetSize,
            },
          ],
        });
        return true;
      },

      updateQuantity: (id, quantity, size) => {
        const targetSize = size || "Standard";

        if (quantity <= 0) {
          get().removeItem(id, size);
          return;
        }

        if (quantity > MAX_ITEM_QUANTITY) {
          alert(`Ek product ki maximum limit ${MAX_ITEM_QUANTITY} units hai.`);
          return;
        }

        set({
          items: get().items.map((item) => {
            if (item.id === id && (item.size || "Standard") === targetSize) {
              return { ...item, quantity };
            }
            return item;
          }),
        });
      },

      removeItem: (id, size) => {
        const targetSize = size || "Standard";
        set({
          items: get().items.filter(
            (item) => !(item.id === id && (item.size || "Standard") === targetSize)
          ),
        });
      },

      clearCart: () => set({ items: [] }),

      totalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      totalPrice: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
      },
    }),
    {
      name: "catchbuddy-customer-cart",
      storage: createJSONStorage(() => localStorage),
      skipHydration: false,
      onRehydrateStorage: () => (state) => {
        // Hydration complete hote hi live catalog check karein
        if (state) {
          void state.syncWithLiveCatalog();
        }
      },
    }
  )
);