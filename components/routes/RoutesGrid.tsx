"use client";

import { useState } from "react";
import { dayLabel, getVisibleDays, isTodayISO, isWeekend } from "@/lib/dates";
import { useDispatchStore } from "@/lib/store";
import { Avatar } from "../ui/Avatar";
import { Droppable } from "../dnd/Droppable";
import { RouteStopCard } from "./RouteStopCard";
import { PlusIcon } from "../ui/Icons";

const ROW_HEADER_WIDTH = 200;
const DAY_COL_WIDTH = 260;

export function RoutesGrid() {
  const range = useDispatchStore((s) => s.scheduleRoutesRange);
  const hideWeekends = useDispatchStore((s) => s.hideWeekends);
  const employees = useDispatchStore((s) => s.employees);
  const projects = useDispatchStore((s) => s.projects);
  const routeStops = useDispatchStore((s) => s.routeStops);
  const routesFilters = useDispatchStore((s) => s.routesFilters);
  const draggingItem = useDispatchStore((s) => s.draggingItem);
  const openModal = useDispatchStore((s) => s.openModal);
  const addEmployee = useDispatchStore((s) => s.addEmployee);
  const [newName, setNewName] = useState("");

  const allDays = getVisibleDays(range);
  const days = hideWeekends ? allDays.filter((d) => !isWeekend(d)) : allDays;

  const search = routesFilters.search.trim().toLowerCase();

  function stopVisible(stop: (typeof routeStops)[number], employeeName: string) {
    if (routesFilters.statuses.length > 0 && !routesFilters.statuses.includes(stop.routeStatus)) return false;
    if (!search) return true;
    const project = projects.find((p) => p.id === stop.projectId);
    const haystack = `${project?.name ?? ""} ${project?.address.street ?? ""} ${project?.address.city ?? ""} ${employeeName}`.toLowerCase();
    return haystack.includes(search);
  }

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
              className="sticky top-0 z-10 flex flex-col items-center justify-center gap-0.5 border-b border-l border-[var(--border-subtle)] bg-[var(--surface)] py-2.5"
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
              const stops = routeStops
                .filter((r) => r.employeeId === employee.id && r.day === day)
                .filter((r) => stopVisible(r, employee.name))
                .sort((a, b) => a.stopNumber - b.stopNumber);
              const isBlocked = draggingItem !== null && draggingItem.kind !== "project";

              return (
                <Droppable
                  key={day}
                  id={`routes-cell-${employee.id}-${day}`}
                  data={{ kind: "routes-cell", employeeId: employee.id, day }}
                  isBlocked={isBlocked}
                  className="group min-h-[92px] min-w-0 overflow-hidden border-b border-l border-[var(--border-subtle)] p-1.5"
                  style={{ backgroundColor: isTodayISO(day) ? "var(--today-bg)" : undefined }}
                >
                  <div className="flex flex-col gap-1.5">
                    {stops.map((stop, i) => (
                      <RouteStopCard
                        key={stop.id}
                        stop={stop}
                        isFirst={i === 0}
                        isLast={i === stops.length - 1}
                      />
                    ))}
                    {stops.length === 0 && (
                      <button
                        onClick={() =>
                          openModal({ type: "add-route-stop", employeeId: employee.id, day })
                        }
                        className="flex items-center justify-center gap-1 rounded-md border border-dashed border-[var(--border)] py-2 text-[11px] text-[var(--muted)] opacity-0 transition-opacity hover:bg-[var(--surface-hover)] group-hover:opacity-100"
                      >
                        <PlusIcon size={12} /> Add route
                      </button>
                    )}
                  </div>
                </Droppable>
              );
            })}
          </div>
        ))}

        <div className="sticky left-0 z-[5] flex items-center border-l border-[var(--border-subtle)] bg-[var(--surface)] px-3 py-2">
          <form
            className="flex items-center gap-1"
            onSubmit={(e) => {
              e.preventDefault();
              if (!newName.trim()) return;
              addEmployee(newName.trim());
              setNewName("");
            }}
          >
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Add crew member…"
              className="w-32 rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-[11px]"
            />
            <button
              type="submit"
              className="rounded-md border border-[var(--border)] p-1 text-[var(--muted)] hover:bg-[var(--surface-hover)]"
              aria-label="Add crew member"
            >
              <PlusIcon size={12} />
            </button>
          </form>
        </div>
        {days.map((day) => (
          <div key={day} className="border-l border-[var(--border-subtle)]" />
        ))}
      </div>
    </div>
  );
}
