"use client";

import type { ReactNode } from "react";
import { useDispatchStore } from "@/lib/store";
import { ChevronDownIcon, ChevronRightIcon } from "../ui/Icons";

export function CollapsibleSection({
  sectionKey,
  title,
  count,
  textColor,
  bgColor,
  defaultCollapsed = false,
  children,
}: {
  sectionKey: string;
  title: string;
  count?: number;
  textColor?: string;
  bgColor?: string;
  defaultCollapsed?: boolean;
  children: ReactNode;
}) {
  const collapsedSet = useDispatchStore((s) => s.collapsedSections);
  const toggleSection = useDispatchStore((s) => s.toggleSection);
  const explicit = collapsedSet.has(sectionKey);
  const explicitOpen = collapsedSet.has(`open:${sectionKey}`);
  const collapsed = defaultCollapsed ? !explicitOpen : explicit;

  function handleToggle() {
    toggleSection(defaultCollapsed ? `open:${sectionKey}` : sectionKey);
  }

  return (
    <div className="border-b border-[var(--border-subtle)]">
      <button
        onClick={handleToggle}
        className="flex w-full items-center gap-1.5 px-3 py-2 text-left text-xs font-semibold"
        style={{ color: textColor, backgroundColor: bgColor }}
      >
        {collapsed ? <ChevronRightIcon size={13} /> : <ChevronDownIcon size={13} />}
        <span className="flex-1 truncate">{title}</span>
        {typeof count === "number" && (
          <span className="rounded-full bg-black/[0.06] px-1.5 py-0.5 text-[10px] font-semibold dark:bg-white/10">
            {count}
          </span>
        )}
      </button>
      {!collapsed && <div>{children}</div>}
    </div>
  );
}
