import {
  Headphones,
  Footprints,
  Watch,
  Sprout,
  Shirt,
  Coffee,
} from "lucide-react";
import type { Product } from "../components/ui/product-card";

export const featuredProducts: Product[] = [
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
    tone: "bg-brand-100 text-brand-700",
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
];

export const categories = [
  "Electronics",
  "Fashion",
  "Home & Living",
  "Food",
  "Sports",
];

export interface AppReview {
  id: string;
  name: string;
  rating: number;
  comment: string;
}

export const seedReviews: AppReview[] = [
  {
    id: "r1",
    name: "Rina W.",
    rating: 5,
    comment:
      "Clean interface and easy to find stores. The checkout breakdown is super clear.",
  },
  {
    id: "r2",
    name: "Dimas S.",
    rating: 4,
    comment:
      "Love having many stores in one app. Navigation feels great on mobile too.",
  },
  {
    id: "r3",
    name: "Putri A.",
    rating: 5,
    comment:
      "Signing up and switching roles is straightforward. Looks like a real marketplace.",
  },
];
