import { Link } from "react-router";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";

export function meta() {
	return [{ title: "Log in · SEAPEDIA" }];
}

export default function Login() {
	return (
		<main className="flex items-center justify-center px-4 py-20">
			<div className="w-full max-w-sm">
				<div className="mb-8 text-center">
					<Link
						to="/"
						className="inline-flex items-center gap-2 text-lg font-semibold tracking-tight"
					>
						<img src="/logo.png" className="h-8 w-8" alt="" />
						SEApedia
					</Link>
					<h1 className="mt-4 text-2xl font-semibold text-gray-900">
						Welcome back
					</h1>
					<p className="mt-1 text-sm text-muted">
						Log in to your account
					</p>
				</div>

				<form className="space-y-4">
					<div>
						<label
							htmlFor="email"
							className="mb-1.5 block text-sm font-medium text-gray-700"
						>
							Email
						</label>
						<Input
							id="email"
							type="email"
							name="email"
							placeholder="you@example.com"
							autoComplete="email"
							required
						/>
					</div>

					<div>
						<div className="mb-1.5 flex items-center justify-between">
							<label
								htmlFor="password"
								className="block text-sm font-medium text-gray-700"
							>
								Password
							</label>
							<span className="text-xs text-brand-700 hover:underline cursor-pointer">
								Forgot password?
							</span>
						</div>
						<Input
							id="password"
							type="password"
							name="password"
							placeholder="••••••••"
							autoComplete="current-password"
							required
						/>
					</div>

					<Button type="submit" className="mt-2 w-full" size="lg">
						Log in
					</Button>
				</form>

				<p className="mt-6 text-center text-sm text-muted">
					Don't have an account?{" "}
					<Link
						to="/register"
						className="font-medium text-brand-700 hover:underline"
					>
						Sign up
					</Link>
				</p>
			</div>
		</main>
	);
}
