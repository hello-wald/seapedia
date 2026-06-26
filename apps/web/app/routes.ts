import {
	type RouteConfig,
	index,
	layout,
	prefix,
	route,
} from "@react-router/dev/routes";

export default [
	index("routes/home.tsx"),

	route("login", "routes/auth/login.tsx"),
	route("register", "routes/auth/register.tsx"),
	route("select-role", "routes/select-role.tsx"),
	route("no-access", "routes/no-access.tsx"),
	route("logout", "routes/logout.tsx"),

	...prefix("products", [
		index("routes/products/home.tsx"),
		route(":id", "routes/products/product.tsx"),
	]),

	route("dashboard", "routes/dashboard/home.tsx"),

	layout("routes/buyer/guard.tsx", [
		route("cart", "routes/buyer/cart.tsx"),
		route("checkout", "routes/buyer/checkout.tsx"),
		route("buyer", "routes/buyer/layout.tsx", [
			index("routes/buyer/index.tsx"),
			route("wallet", "routes/buyer/wallet.tsx"),
			route("addresses", "routes/buyer/addresses.tsx"),
			route("orders", "routes/buyer/orders.tsx"),
			route("orders/:id", "routes/buyer/order-detail.tsx"),
		]),
	]),
	route("seller", "routes/seller/layout.tsx", [
		index("routes/seller/home.tsx"),
		route("products", "routes/seller/products.tsx"),
		route("orders", "routes/seller/orders.tsx"),
		route("orders/:id", "routes/seller/order-detail.tsx"),
	]),
	route("driver", "routes/driver/layout.tsx", [
		index("routes/driver/index.tsx"),
		route("find", "routes/driver/find.tsx"),
		route("jobs", "routes/driver/jobs.tsx"),
		route("jobs/:id", "routes/driver/jobs-detail.tsx"),
	]),
	route("admin", "routes/admin/layout.tsx", [index("routes/admin/home.tsx")]),
] satisfies RouteConfig;
