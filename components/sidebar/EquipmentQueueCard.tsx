"use client";

import type { Equipment } from "@/lib/types";
import { Draggable } from "../dnd/Draggable";
import { GripIcon } from "../ui/Icons";

export function EquipmentQueueCard({ equipment }: { equipment: Equipment }) {
  return (
    <Draggable
      id={`queue-equipment-${equipment.id}`}
      data={{ kind: "equipment", equipment }}
      className="group flex items-center gap-2 rounded-md border border-[var(--border-subtle)] bg-[var(--surface)] px-2.5 py-2 hover:border-[var(--border)] hover:shadow-sm"
    >
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-amber-400/90 text-white">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="3" width="18" height="18" rx="3" fill="currentColor" opacity="0.001" />
          <path
            d="M4 17V9l4-4h8l4 4v8H4Z"
            stroke="white"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span className="flex-1 truncate text-xs font-medium text-[var(--foreground)]">
        {equipment.name}
      </span>
      <span className="shrink-0 cursor-grab text-[var(--muted-2)] active:cursor-grabbing">
        <GripIcon size={13} />
      </span>
    </Draggable>
  );
}
