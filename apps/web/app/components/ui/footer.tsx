import { Link } from "react-router";
import { Mail, Share2 } from "lucide-react";

const columns = [
	{
		title: "Explore",
		links: [
			{ label: "Products", to: "/products" },
			{ label: "Stores", to: "/stores" },
			{ label: "Categories", to: "/products" },
		],
	},
	{
		title: "Get started",
		links: [
			{ label: "How to shop", to: "/register" },
			{ label: "Become a seller", to: "/register" },
			{ label: "Become a driver", to: "/register" },
		],
	},
];

export function Footer() {
	return (
		<footer className="bg-gray-900 text-brand-100">
			<div className="container mx-auto grid grid-cols-2 gap-8 px-4 py-10 sm:grid-cols-5">
				<div className="col-span-2">
					<div className="mb-2 text-base font-medium text-brand-600">
						SEApedia
					</div>
					<p className="text-sm leading-relaxed text-brand-50">
						A multi-store marketplace for buyers, sellers, and
						drivers.
					</p>
				</div>

				{columns.map((col) => (
					<div key={col.title}>
						<div className="mb-3 text-sm font-medium text-brand-600">
							{col.title}
						</div>
						<ul className="space-y-2 text-sm text-brand-50">
							{col.links.map((link) => (
								<li key={link.label}>
									<Link
										to={link.to}
										className="hover:text-white"
									>
										{link.label}
									</Link>
								</li>
							))}
						</ul>
					</div>
				))}

				<div>
					<div className="mb-3 text-sm font-medium text-brand-600">
						Follow us
					</div>
					<div className="flex gap-3 text-brand-50">
						<a
							href="#"
							aria-label="Social"
							className="hover:text-white"
						>
							<Share2 size={20} aria-hidden="true" />
						</a>
						<a
							href="#"
							aria-label="Email"
							className="hover:text-white"
						>
							<Mail size={20} aria-hidden="true" />
						</a>
					</div>
				</div>
			</div>
			<div className="py-4 text-center text-xs text-brand-100/70">
				© 2026 SEApedia · Built for COMPFEST 18
			</div>
		</footer>
	);
}
