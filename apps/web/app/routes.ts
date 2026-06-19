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

	...prefix("products", [
		index("routes/products/home.tsx"),
		route(":id", "routes/products/product.tsx"),
	]),
] satisfies RouteConfig;
