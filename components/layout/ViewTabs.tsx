"use client";

import { useDispatchStore } from "@/lib/store";
import type { ViewKey } from "@/lib/types";
import { cn } from "@/lib/cn";
import { CalendarDashIcon, CalendarIcon, RouteIcon, UsersLoadIcon } from "../ui/Icons";

const TABS: { key: ViewKey; label: string; Icon: typeof CalendarIcon }[] = [
  { key: "schedule", label: "Schedule", Icon: CalendarIcon },
  { key: "routes", label: "Routes", Icon: RouteIcon },
  { key: "workload", label: "Workload", Icon: UsersLoadIcon },
  { key: "availability", label: "Availability", Icon: CalendarDashIcon },
];

export function ViewTabs() {
  const activeView = useDispatchStore((s) => s.activeView);
  const setActiveView = useDispatchStore((s) => s.setActiveView);

  return (
    <div className="flex items-center gap-1 border-b border-[var(--border-subtle)] px-4">
      {TABS.map(({ key, label, Icon }) => {
        const active = activeView === key;
        return (
          <button
            key={key}
            onClick={() => setActiveView(key)}
            className={cn(
              "flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "border-[var(--foreground)] text-[var(--foreground)]"
                : "border-transparent text-[var(--muted)] hover:text-[var(--foreground)]"
            )}
          >
            <Icon size={15} />
            {label}
          </button>
        );
      })}
    </div>
  );
}
