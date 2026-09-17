import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger";

export function Button({
  variant = "secondary",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  const base =
    "inline-flex items-center justify-center gap-1.5 rounded-md text-sm font-medium px-3 py-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
  const variants: Record<Variant, string> = {
    primary:
      "bg-[var(--foreground)] text-[var(--background)] hover:opacity-90 border border-transparent",
    secondary:
      "bg-[var(--surface)] text-[var(--foreground)] border border-[var(--border)] hover:bg-[var(--surface-hover)]",
    ghost: "bg-transparent text-[var(--foreground)] border border-transparent hover:bg-[var(--surface-hover)]",
    danger: "bg-transparent text-red-600 border border-red-200 hover:bg-red-50 dark:border-red-900/50 dark:hover:bg-red-950/30",
  };
  return <button className={cn(base, variants[variant], className)} {...props} />;
}
