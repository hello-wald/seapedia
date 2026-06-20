import type { ReactNode } from "react";

export function ErrorBanner({
	children,
	className = "",
}: {
	children: ReactNode;
	className?: string;
}) {
	return (
		<p
			className={`rounded-md border border-destructive/25! bg-red-50 px-3 py-2 text-sm text-destructive ${className}`}
		>
			{children}
		</p>
	);
}

export function SuccessBanner({
	children,
	className = "",
}: {
	children: ReactNode;
	className?: string;
}) {
	return (
		<p
			className={`rounded-md border border-success/25! bg-green-50 px-3 py-2 text-sm text-success ${className}`}
		>
			{children}
		</p>
	);
}
