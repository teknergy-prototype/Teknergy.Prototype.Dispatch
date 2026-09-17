"use client";

import { entriesForCell } from "@/lib/availability";
import { getStatusColor, DAYOFF_BADGE } from "@/lib/colors";
import { dayLabel, getVisibleDays, isTodayISO, isWeekend } from "@/lib/dates";
import { matchesSearch, matchesStatusCategory } from "@/lib/filters";
import { useDispatchStore } from "@/lib/store";
import { Avatar } from "../ui/Avatar";
import { Badge } from "../ui/Badge";

const ROW_HEADER_WIDTH = 210;
const DAY_COL_WIDTH = 200;

export function WorkloadGrid() {
  const range = useDispatchStore((s) => s.scheduleRoutesRange);
  const hideWeekends = useDispatchStore((s) => s.hideWeekends);
  const employees = useDispatchStore((s) => s.employees);
  const projects = useDispatchStore((s) => s.projects);
  const crewAssignments = useDispatchStore((s) => s.crewAssignments);
  const availabilityEntries = useDispatchStore((s) => s.availabilityEntries);
  const filters = useDispatchStore((s) => s.filters);
  const openModal = useDispatchStore((s) => s.openModal);

  const allDays = getVisibleDays(range);
  const days = hideWeekends ? allDays.filter((d) => !isWeekend(d)) : allDays;

  const projectsById = new Map(projects.map((p) => [p.id, p]));

  function visibleAssignmentsFor(employeeId: string, day: string) {
    return crewAssignments
      .filter((a) => a.employeeId === employeeId && a.day === day)
      .map((a) => projectsById.get(a.projectId))
      .filter((p): p is NonNullable<typeof p> => Boolean(p))
      .filter(
        (p) =>
          matchesStatusCategory(p, filters.statuses, filters.categories) &&
          matchesSearch(p, filters.search, crewAssignments, employees)
      );
  }

  function loadCountFor(employeeId: string) {
    return days.reduce((sum, day) => sum + visibleAssignmentsFor(employeeId, day).length, 0);
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

        {employees.map((employee) => {
          const load = loadCountFor(employee.id);
          return (
            <div key={employee.id} className="contents">
              <div className="sticky left-0 z-[5] flex items-center gap-2 border-b border-l border-[var(--border-subtle)] bg-[var(--surface)] px-3 py-2">
                <Avatar name={employee.name} color={employee.avatarColor} size={26} />
                <span className="min-w-0 flex-1 truncate text-xs font-medium text-[var(--foreground)]">
                  {employee.name}
                </span>
                <span
                  className="shrink-0 rounded-full bg-black/[0.06] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--muted)] dark:bg-white/10"
                  title={`${load} assignment${load === 1 ? "" : "s"} in this range`}
                >
                  {load}
                </span>
              </div>
              {days.map((day) => {
                const dayProjects = visibleAssignmentsFor(employee.id, day);
                const offEntries = entriesForCell(availabilityEntries, employee.id, day).filter(
                  (e) => e.category === "dayoff"
                );

                return (
                  <div
                    key={day}
                    className="flex min-h-[92px] min-w-0 flex-col gap-1.5 overflow-hidden border-b border-l border-[var(--border-subtle)] p-1.5"
                    style={{ backgroundColor: isTodayISO(day) ? "var(--today-bg)" : undefined }}
                  >
                    {offEntries.length > 0 && (
                      <Badge bg={DAYOFF_BADGE.bg} text={DAYOFF_BADGE.text} className="w-fit">
                        Day Off
                      </Badge>
                    )}
                    {dayProjects.map((project) => {
                      const statusColor = getStatusColor(project.status);
                      return (
                        <button
                          key={project.id}
                          onClick={() => openModal({ type: "project-detail", projectId: project.id })}
                          className="flex w-full min-w-0 flex-col gap-1 rounded-md border border-[var(--border-subtle)] bg-[var(--surface)] p-2 text-left shadow-sm hover:border-[var(--border)]"
                          style={{ borderLeftWidth: 3, borderLeftColor: project.serviceCategory.color }}
                        >
                          <span className="min-w-0 truncate text-xs font-medium text-[var(--foreground)]">
                            {project.name}
                          </span>
                          <span className="truncate text-[10px] text-[var(--muted)]">
                            #{project.id} · {project.address.street}
                          </span>
                          <Badge bg={statusColor.bg} text={statusColor.text} className="w-fit">
                            {project.status}
                          </Badge>
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
