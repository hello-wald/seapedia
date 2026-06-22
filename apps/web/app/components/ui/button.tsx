import { type ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "accent" | "outline" | "ghost";
type Size = "xs" | "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
	primary: "bg-brand-600 text-surface hover:opacity-90",
	secondary: "bg-brand-100/50 text-gray-700 hover:bg-brand-100/75",
	accent: "bg-white text-brand-600 hover:bg-brand-50",
	outline:
		"border border-brand-600! text-brand-600 hover:bg-brand-50 hover:opacity-90",
	ghost: "text-gray-700 hover:bg-gray-100",
};

const sizes: Record<Size, string> = {
	xs: "h-8 px-3 text-xs",
	sm: "h-9 px-3 text-sm",
	md: "h-10 px-4 text-sm",
	lg: "h-11 px-6 text-base",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: Variant;
	size?: Size;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
	({ variant = "primary", size = "md", className = "", ...props }, ref) => (
		<button
			ref={ref}
			className={`inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}
			{...props}
		/>
	),
);

Button.displayName = "Button";
