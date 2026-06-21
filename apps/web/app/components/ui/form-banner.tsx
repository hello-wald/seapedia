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
			className={`rounded-md h-10 px-3 flex items-center border border-destructive/25! bg-red-50 text-sm text-destructive ${className}`}
		>
			{children}
		</p>
	);
}
