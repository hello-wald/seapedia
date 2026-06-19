import type { LucideIcon } from "lucide-react";
import {
  Headphones,
  Footprints,
  Watch,
  Sprout,
  Shirt,
  Coffee,
  Laptop,
  BookOpen,
  Dumbbell,
  UtensilsCrossed,
  Backpack,
  Lamp,
} from "lucide-react";

export interface ApiProduct {
  id: string;
  name: string;
  price: number;
  storeName: string;
  city: string;
  rating: number;
  sold: string;
}

export interface ProductDisplay extends ApiProduct {
  icon: LucideIcon;
  tone: string;
}

export const allProducts: ProductDisplay[] = [
  {
    id: "p1",
    name: "Bluetooth Noise-Cancelling Headset",
    price: 249000,
    storeName: "AudioHub",
    city: "Jakarta",
    rating: 4.9,
    sold: "1k+",
    icon: Headphones,
    tone: "bg-sky-100 text-sky-700",
  },
  {
    id: "p2",
    name: "Lightweight Anti-Slip Running Shoes",
    price: 389000,
    storeName: "SportLine",
    city: "Bandung",
    rating: 4.8,
    sold: "850",
    icon: Footprints,
    tone: "bg-amber-100 text-amber-700",
  },
  {
    id: "p3",
    name: "Waterproof AMOLED Smartwatch",
    price: 512000,
    storeName: "GadgetKu",
    city: "Surabaya",
    rating: 5.0,
    sold: "2k+",
    icon: Watch,
    tone: "bg-violet-100 text-violet-700",
  },
  {
    id: "p4",
    name: "Monstera Plant in Ceramic Pot",
    price: 135000,
    storeName: "HijauAsri",
    city: "Yogyakarta",
    rating: 4.7,
    sold: "430",
    icon: Sprout,
    tone: "bg-brand-100 text-brand-900",
  },
  {
    id: "p5",
    name: "Premium Cotton Oversized T-Shirt",
    price: 99000,
    storeName: "UrbanWear",
    city: "Semarang",
    rating: 4.6,
    sold: "3k+",
    icon: Shirt,
    tone: "bg-rose-100 text-rose-700",
  },
  {
    id: "p6",
    name: "Single-Origin Arabica Coffee Beans",
    price: 78000,
    storeName: "KopiNusantara",
    city: "Medan",
    rating: 4.9,
    sold: "1.5k+",
    icon: Coffee,
    tone: "bg-orange-100 text-orange-700",
  },
  {
    id: "p7",
    name: 'Ultrabook Laptop 14" Intel Core i7',
    price: 8500000,
    storeName: "TechStore",
    city: "Jakarta",
    rating: 4.8,
    sold: "320",
    icon: Laptop,
    tone: "bg-blue-100 text-blue-700",
  },
  {
    id: "p8",
    name: "Indonesian Batik Design Sketchbook",
    price: 45000,
    storeName: "KaryaLokal",
    city: "Solo",
    rating: 4.5,
    sold: "720",
    icon: BookOpen,
    tone: "bg-emerald-100 text-emerald-700",
  },
  {
    id: "p9",
    name: "Adjustable Dumbbell Set 2–20 kg",
    price: 650000,
    storeName: "FitGear",
    city: "Surabaya",
    rating: 4.7,
    sold: "590",
    icon: Dumbbell,
    tone: "bg-red-100 text-red-700",
  },
  {
    id: "p10",
    name: "Traditional Rendang Spice Kit",
    price: 55000,
    storeName: "BumbuNusantara",
    city: "Padang",
    rating: 4.9,
    sold: "2.3k+",
    icon: UtensilsCrossed,
    tone: "bg-yellow-100 text-yellow-700",
  },
  {
    id: "p11",
    name: "Waterproof Laptop Backpack 30L",
    price: 295000,
    storeName: "TravelKu",
    city: "Bali",
    rating: 4.6,
    sold: "1.1k+",
    icon: Backpack,
    tone: "bg-teal-100 text-teal-700",
  },
  {
    id: "p12",
    name: "Minimalist Rattan Desk Lamp",
    price: 185000,
    storeName: "DekorRumah",
    city: "Bandung",
    rating: 4.8,
    sold: "670",
    icon: Lamp,
    tone: "bg-amber-100 text-amber-800",
  },
];
