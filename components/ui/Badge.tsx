import type { ReactNode } from "react";

export function Badge({
  children,
  bg,
  text,
  className,
}: {
  children: ReactNode;
  bg?: string;
  text?: string;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium leading-none whitespace-nowrap ${className ?? ""}`}
      style={bg || text ? { backgroundColor: bg, color: text } : undefined}
    >
      {children}
    </span>
  );
}
