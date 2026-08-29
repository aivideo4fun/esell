export interface Product {
  id: string;
  title: string;
  price: number;
  originalPrice: number;
  category: string;
  image: string;
  badge?: string;
  rating: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
}

export const CATEGORIES: Category[] = [
  { id: "1", name: "Toys & Games", slug: "toys", icon: "🧸" },
  { id: "2", name: "Smart Gadgets", slug: "gadgets", icon: "🔌" },
  { id: "3", name: "Kitchen Essentials", slug: "kitchen", icon: "🍳" },
  { id: "4", name: "Home Living", slug: "home", icon: "🏠" },
  { id: "5", name: "Beauty & Care", slug: "beauty", icon: "💄" },
  { id: "6", name: "Car Accessories", slug: "car-accessories", icon: "🚗" },
];

export const FEATURED_PRODUCTS: Product[] = [
  {
    id: "1",
    title: "Smart Multi-Functional LED Desk Lamp",
    price: 1299,
    originalPrice: 2499,
    category: "gadgets",
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500&q=80",
    badge: "Trending",
    rating: 4.8,
  },
  {
    id: "2",
    title: "Automatic Wireless Water Dispenser Pump",
    price: 499,
    originalPrice: 999,
    category: "kitchen",
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&q=80",
    badge: "Best Seller",
    rating: 4.7,
  },
  {
    id: "3",
    title: "Car Dashboard Solar Powered Air Freshener",
    price: 699,
    originalPrice: 1299,
    category: "car-accessories",
    image: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=500&q=80",
    badge: "Hot",
    rating: 4.9,
  },
  {
    id: "4",
    title: "Educational Magnetic Building Blocks Set",
    price: 899,
    originalPrice: 1599,
    category: "toys",
    image: "https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=500&q=80",
    badge: "Kids Choice",
    rating: 4.8,
  },
];

export const TRUST_POINTS = [
  { title: "100% Prepaid Safe", desc: "Encrypted & secured checkout with instant verification." },
  { title: "Fast Dispatch", desc: "Direct pan-India dispatch with live tracking updates." },
  { title: "Quality Checked", desc: "Handpicked premium products before shipping." },
  { title: "WhatsApp Support", desc: "Dedicated order updates directly to your phone." },
];