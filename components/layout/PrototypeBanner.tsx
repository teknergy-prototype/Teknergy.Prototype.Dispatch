"use client";

import { useState } from "react";
import { XIcon } from "../ui/Icons";

export function PrototypeBanner() {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <div className="flex items-center gap-2 border-b border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
      <span className="shrink-0" aria-hidden>
        🧪
      </span>
      <p className="min-w-0 flex-1">
        <span className="font-semibold">Prototype — for demonstration only.</span>{" "}
        All data on this page is sample data running in your browser: nothing is saved, no real
        crews or projects are affected, and the AI recommendations use simulated logic, not a real
        AI model.
      </p>
      <button
        onClick={() => setDismissed(true)}
        className="shrink-0 rounded-md p-1 text-amber-700 hover:bg-amber-100 dark:text-amber-300 dark:hover:bg-amber-900/40"
        aria-label="Dismiss"
      >
        <XIcon size={13} />
      </button>
    </div>
  );
}
