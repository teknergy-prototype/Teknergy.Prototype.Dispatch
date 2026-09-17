"use client";

import { dayLabel, isTodayISO } from "@/lib/dates";
import { useDispatchStore } from "@/lib/store";
import type { ISODate } from "@/lib/types";
import { Droppable } from "../dnd/Droppable";

export function DayColumnHeader({ day }: { day: ISODate }) {
  const draggingItem = useDispatchStore((s) => s.draggingItem);
  const { weekday, dateNum } = dayLabel(day);
  const isToday = isTodayISO(day);
  const isBlocked = draggingItem !== null && draggingItem.kind !== "project";

  return (
    <Droppable
      id={`day-header-${day}`}
      data={{ kind: "day-header", day }}
      isBlocked={isBlocked}
      className="sticky top-0 z-10 flex flex-col items-center justify-center gap-0.5 border-b border-l border-[var(--border-subtle)] bg-[var(--surface)] py-2.5"
      style={{ backgroundColor: isToday ? "var(--today-bg)" : undefined }}
    >
      <span className="text-[10px] font-medium uppercase tracking-wide text-[var(--muted)]">
        {weekday}
      </span>
      <span className="text-xs font-semibold text-[var(--foreground)]">{dateNum}</span>
    </Droppable>
  );
}
