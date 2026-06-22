import {
	type RouteConfig,
	index,
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
	route("buyer", "routes/buyer/layout.tsx", [
		index("routes/buyer/home.tsx"),
		route("wallet", "routes/buyer/wallet.tsx"),
		route("addresses", "routes/buyer/addresses.tsx"),
		route("cart", "routes/buyer/cart.tsx"),
		route("orders", "routes/buyer/orders.tsx"),
	]),
	route("seller", "routes/seller/layout.tsx", [
		index("routes/seller/home.tsx"),
		route("products", "routes/seller/products.tsx"),
		route("orders", "routes/seller/orders.tsx"),
	]),
	route("driver", "routes/driver/layout.tsx", [
		index("routes/driver/home.tsx"),
		route("jobs", "routes/driver/jobs.tsx"),
	]),
	route("admin", "routes/admin/layout.tsx", [index("routes/admin/home.tsx")]),
] satisfies RouteConfig;
