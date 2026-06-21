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
