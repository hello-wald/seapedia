import { useState } from "react";
import { Link } from "react-router";
import type { Route } from "./+types/home";
import { Button } from "../components/ui/button";
import { Input, Textarea } from "../components/ui/input";
import { Card } from "../components/ui/card";
import { StarRating } from "../components/ui/star-rating";
import { ProductCard } from "../components/product/product-card";
import { categories, seedReviews, type AppReview } from "../data/landing";
import { getCatalog } from "../.server/products";

export function meta(_: Route.MetaArgs) {
	return [
		{ title: "SEApedia" },
		{
			name: "description",
			content:
				"Shop from sellers across Indonesia on SEApedia — a multi-store marketplace for buyers, sellers, and drivers.",
		},
	];
}

export async function loader(_: Route.LoaderArgs) {
	const products = await getCatalog();
	return { featured: (products ?? []).slice(0, 6) };
}

export default function Home({ loaderData }: Route.ComponentProps) {
	const { featured } = loaderData;
	const [reviews, setReviews] = useState<AppReview[]>(seedReviews);
	const [name, setName] = useState("");
	const [rating, setRating] = useState(5);
	const [comment, setComment] = useState("");

	function handleSubmit(event: React.FormEvent) {
		event.preventDefault();
		if (!name.trim() || !comment.trim()) return;
		setReviews((prev) => [
			{
				id: crypto.randomUUID(),
				name: name.trim(),
				rating,
				comment: comment.trim(),
			},
			...prev,
		]);
		setName("");
		setComment("");
		setRating(5);
	}

	return (
		<main>
			<section>
				<div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-10 lg:grid-cols-[1.8fr_1fr]">
					<div>
						<span className="mb-3 inline-block rounded-md bg-brand-100 px-3 py-1 text-xs font-medium text-brand-700">
							One marketplace · thousands of stores
						</span>
						<h1 className="text-3xl font-medium leading-tight text-gray-900 sm:text-4xl">
							Shop from many stores,{" "}
							<span className="text-brand-600">one place</span>
						</h1>
						<p className="mt-3 max-w-lg text-sm leading-relaxed text-gray-600">
							Discover products from sellers across Indonesia.
							Compare, pick your favorite store, and check out
							securely.
						</p>
						<div className="mt-5 flex flex-wrap gap-3">
							<Link to="/products">
								<Button size="lg">Start shopping</Button>
							</Link>
							<Link to="/register">
								<Button variant="outline" size="lg">
									Sign up free
								</Button>
							</Link>
						</div>
					</div>
					<img src="/hero.png" />
				</div>

				<div className="mx-auto flex max-w-6xl flex-wrap items-center gap-2 px-4 pb-8">
					<span className="text-sm text-gray-500">Categories:</span>
					{categories.map((category) => (
						<Link
							key={category}
							to="/products"
							className="rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-700 hover:border-brand-600 hover:text-brand-700"
						>
							{category}
						</Link>
					))}
				</div>
			</section>

			<section className="border-t bg-surface">
				<div className="mx-auto max-w-6xl px-4 py-10">
					<div className="mb-5 flex items-baseline justify-between">
						<h2 className="text-xl font-medium text-gray-900">
							Featured products
						</h2>
						<Link
							to="/products"
							className="text-sm text-brand-700 hover:underline"
						>
							See all
						</Link>
					</div>
					{featured.length === 0 ? (
						<p className="py-8 text-sm text-muted">
							No products yet — be the first seller to list one.
						</p>
					) : (
						<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
							{featured.map((product) => (
								<Link
									key={product.id}
									to={`/products/${product.id}`}
								>
									<ProductCard product={product} />
								</Link>
							))}
						</div>
					)}
				</div>
			</section>

			<section className="border-t">
				<div className="mx-auto max-w-6xl px-4 py-12">
					<h2 className="text-xl font-medium text-gray-900">
						What people say
					</h2>
					<p className="mt-1 max-w-2xl text-sm text-muted">
						Reviews about the SEApedia app experience — anyone can
						write one, no purchase required.
					</p>

					<div className="mt-6 grid gap-6 lg:grid-cols-2">
						<div className="space-y-3">
							{reviews.map((review) => (
								<Card key={review.id} className="p-4">
									<div className="mb-1 flex items-center justify-between">
										<span className="text-sm font-medium text-gray-900">
											{review.name}
										</span>
										<StarRating value={review.rating} />
									</div>
									<p className="text-sm leading-relaxed text-muted">
										{review.comment}
									</p>
								</Card>
							))}
						</div>

						<Card className="h-fit p-5">
							<h3 className="text-base font-medium text-gray-900">
								Write a review
							</h3>
							<form
								onSubmit={handleSubmit}
								className="mt-4 space-y-3"
							>
								<div>
									<label
										htmlFor="review-name"
										className="text-sm text-gray-700"
									>
										Your name
									</label>
									<Input
										id="review-name"
										value={name}
										onChange={(e) =>
											setName(e.target.value)
										}
										placeholder="e.g. Andi"
										className="mt-1"
										required
									/>
								</div>
								<div>
									<span className="text-sm text-gray-700">
										Rating
									</span>
									<div className="mt-1">
										<StarRating
											value={rating}
											onChange={setRating}
											size={24}
										/>
									</div>
								</div>
								<div>
									<label
										htmlFor="review-comment"
										className="text-sm text-gray-700"
									>
										Comment
									</label>
									<Textarea
										id="review-comment"
										value={comment}
										onChange={(e) =>
											setComment(e.target.value)
										}
										placeholder="Tell us about your experience using SEAPEDIA…"
										rows={3}
										className="mt-1"
										required
									/>
								</div>
								<Button type="submit">Submit review</Button>
							</form>
						</Card>
					</div>
				</div>
			</section>
		</main>
	);
}
