import {
  type InputHTMLAttributes,
  type TextareaHTMLAttributes,
  forwardRef,
} from "react";

const base =
  "w-full rounded-md border border-border-strong bg-surface px-3 text-sm text-gray-900 placeholder:text-muted-subtle outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20";

export const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>(({ className = "", ...props }, ref) => (
  <input ref={ref} className={`h-10 ${base} ${className}`} {...props} />
));

Input.displayName = "Input";

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className = "", ...props }, ref) => (
  <textarea ref={ref} className={`py-2 ${base} ${className}`} {...props} />
));

Textarea.displayName = "Textarea";
