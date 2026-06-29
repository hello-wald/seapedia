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
  {
    id: "r4",
    name: "Bima R.",
    rating: 5,
    comment:
      "Pengiriman cepat dan seller-nya responsif. Aplikasinya gampang banget dipakai!",
  },
  {
    id: "r5",
    name: "Farida T.",
    rating: 4,
    comment:
      "Product variety is great. Would love a wishlist feature in the future.",
  },
];
