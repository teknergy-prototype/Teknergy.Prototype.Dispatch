"use client";

import { entriesForCell } from "@/lib/availability";
import { dayLabel, getVisibleDays, isTodayISO } from "@/lib/dates";
import { useDispatchStore } from "@/lib/store";
import { Avatar } from "../ui/Avatar";
import { Droppable } from "../dnd/Droppable";
import { AvailabilityCard } from "./AvailabilityCard";
import { PlusIcon } from "../ui/Icons";

const ROW_HEADER_WIDTH = 200;
const DAY_COL_WIDTH = 220;

export function AvailabilityGrid() {
  const availabilityAnchor = useDispatchStore((s) => s.availabilityAnchor);
  const employees = useDispatchStore((s) => s.employees);
  const availabilityEntries = useDispatchStore((s) => s.availabilityEntries);
  const draggingItem = useDispatchStore((s) => s.draggingItem);
  const openModal = useDispatchStore((s) => s.openModal);

  const days = getVisibleDays(
    { anchor: availabilityAnchor, mode: "7day", customStart: null, customEnd: null },
    true
  );

  return (
    <div className="flex-1 overflow-auto">
      <div
        className="grid"
        style={{ gridTemplateColumns: `${ROW_HEADER_WIDTH}px repeat(${days.length}, ${DAY_COL_WIDTH}px)` }}
      >
        <div className="sticky left-0 top-0 z-20 flex items-center border-b border-[var(--border-subtle)] bg-[var(--surface)] px-3 py-2.5 text-xs font-semibold text-[var(--foreground)]">
          Crew
        </div>
        {days.map((day) => {
          const { weekday, dateNum } = dayLabel(day);
          const isToday = isTodayISO(day);
          return (
            <div
              key={day}
              className="sticky top-0 z-10 flex flex-col items-center justify-center gap-0.5 border-b border-l border-[var(--border-subtle)] py-2.5"
              style={{ backgroundColor: isToday ? "var(--today-bg)" : undefined }}
            >
              <span className="text-[10px] font-medium uppercase tracking-wide text-[var(--muted)]">
                {weekday}
              </span>
              <span className="text-xs font-semibold text-[var(--foreground)]">{dateNum}</span>
            </div>
          );
        })}

        {employees.map((employee) => (
          <div key={employee.id} className="contents">
            <div className="sticky left-0 z-[5] flex items-center gap-2 border-b border-l border-[var(--border-subtle)] bg-[var(--surface)] px-3 py-2">
              <Avatar name={employee.name} color={employee.avatarColor} size={26} />
              <span className="truncate text-xs font-medium text-[var(--foreground)]">
                {employee.name}
              </span>
            </div>
            {days.map((day) => {
              const entries = entriesForCell(availabilityEntries, employee.id, day);
              const isBlocked =
                draggingItem !== null &&
                (draggingItem.kind !== "crew" || draggingItem.employee.id !== employee.id);

              return (
                <Droppable
                  key={day}
                  id={`availability-cell-${employee.id}-${day}`}
                  data={{ kind: "availability-cell", employeeId: employee.id, day }}
                  isBlocked={isBlocked}
                  className="group min-h-[92px] min-w-0 overflow-hidden border-b border-l border-[var(--border-subtle)] p-1.5"
                  style={{ backgroundColor: isTodayISO(day) ? "var(--today-bg)" : undefined }}
                >
                  <div className="flex flex-col gap-1.5">
                    {entries.map((entry) => (
                      <AvailabilityCard key={entry.id} entry={entry} />
                    ))}
                    <button
                      onClick={() => openModal({ type: "add-availability", employeeId: employee.id, day })}
                      className={`flex items-center justify-center gap-1 rounded-md border border-dashed border-[var(--border)] py-2 text-[11px] text-[var(--muted)] transition-opacity hover:bg-[var(--surface-hover)] ${
                        entries.length === 0 ? "opacity-0 group-hover:opacity-100" : "opacity-0 group-hover:opacity-100"
                      }`}
                    >
                      <PlusIcon size={12} /> Add
                    </button>
                  </div>
                </Droppable>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
