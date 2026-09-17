"use client";

import { useEffect, useState } from "react";
import { MoonIcon, SunIcon } from "../ui/Icons";

export function ThemeToggle() {
  const [dark, setDark] = useState(() => window.matchMedia("(prefers-color-scheme: dark)").matches);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return (
    <button
      onClick={() => setDark((d) => !d)}
      className="rounded-md border border-[var(--border)] p-1.5 text-[var(--foreground)] hover:bg-[var(--surface-hover)]"
      aria-label="Toggle theme"
    >
      {dark ? <SunIcon size={14} /> : <MoonIcon size={14} />}
    </button>
  );
}
