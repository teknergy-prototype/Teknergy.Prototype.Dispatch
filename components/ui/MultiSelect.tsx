"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { ChevronDownIcon } from "./Icons";

export function MultiSelect({
  label,
  options,
  selected,
  onChange,
}: {
  label: string;
  options: { value: string; label: string }[];
  selected: string[];
  onChange: (values: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function toggle(value: string) {
    if (selected.includes(value)) onChange(selected.filter((v) => v !== value));
    else onChange([...selected, value]);
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex items-center gap-1.5 rounded-md border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1.5 text-xs font-medium text-[var(--foreground)] hover:bg-[var(--surface-hover)]"
        )}
      >
        {label}
        {selected.length > 0 && (
          <span className="rounded-full bg-[var(--foreground)] px-1.5 text-[10px] font-semibold text-[var(--background)]">
            {selected.length}
          </span>
        )}
        <ChevronDownIcon size={12} />
      </button>
      {open && (
        <div className="animate-fade-in absolute left-0 top-full z-30 mt-1 max-h-64 w-52 overflow-auto rounded-md border border-[var(--border)] bg-[var(--surface)] p-1 shadow-lg">
          {options.map((opt) => (
            <label
              key={opt.value}
              className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-xs hover:bg-[var(--surface-hover)]"
            >
              <input
                type="checkbox"
                checked={selected.includes(opt.value)}
                onChange={() => toggle(opt.value)}
                className="h-3.5 w-3.5 accent-[var(--foreground)]"
              />
              <span className="truncate">{opt.label}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
