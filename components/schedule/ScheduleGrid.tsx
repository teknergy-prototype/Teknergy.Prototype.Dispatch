"use client";

import { getVisibleDays, isTodayISO, isWeekend } from "@/lib/dates";
import { matchesSearch, matchesStatusCategory } from "@/lib/filters";
import { buildGridRows, hasDate } from "@/lib/queue";
import { activeChangeMap, effectiveWorkDays } from "@/lib/proposal";
import { useDispatchStore } from "@/lib/store";
import { DayColumnHeader } from "./DayColumnHeader";
import { ProjectCard } from "./ProjectCard";
import { ScheduleRowHeader } from "./ScheduleRowHeader";

const ROW_HEADER_WIDTH = 220;
const DAY_COL_WIDTH = 140;

export function ScheduleGrid() {
  const range = useDispatchStore((s) => s.scheduleRoutesRange);
  const hideWeekends = useDispatchStore((s) => s.hideWeekends);
  const projects = useDispatchStore((s) => s.projects);
  const crewAssignments = useDispatchStore((s) => s.crewAssignments);
  const employees = useDispatchStore((s) => s.employees);
  const filters = useDispatchStore((s) => s.filters);
  const proposal = useDispatchStore((s) => s.proposal);

  const allDays = getVisibleDays(range);
  const days = hideWeekends ? allDays.filter((d) => !isWeekend(d)) : allDays;

  const overlayActive = proposal?.status === "draft";
  const changeMap = overlayActive ? activeChangeMap(proposal.changes) : new Map();

  const effectiveProjects = projects.map((p) => {
    const change = changeMap.get(p.id);
    if (!change) return p;
    return { ...p, workDays: effectiveWorkDays(p, change) };
  });

  const filteredProjects = effectiveProjects.filter(
    (p) =>
      hasDate(p) &&
      matchesSearch(p, filters.search, crewAssignments, employees) &&
      matchesStatusCategory(p, filters.statuses, filters.categories)
  );
  const rows = buildGridRows(filteredProjects);

  return (
    <div className="flex-1 overflow-auto">
      <div
        className="grid"
        style={{ gridTemplateColumns: `${ROW_HEADER_WIDTH}px repeat(${days.length}, ${DAY_COL_WIDTH}px)` }}
      >
        <div className="sticky left-0 top-0 z-20 flex items-center border-b border-[var(--border-subtle)] bg-[var(--surface)] px-3 py-2.5 text-xs font-semibold text-[var(--foreground)]">
          Project
        </div>
        {days.map((day) => (
          <DayColumnHeader key={day} day={day} />
        ))}

        {rows.map(({ project, depth }) => {
          const change = changeMap.get(project.id);
          const isNewProposedRow = Boolean(change) && !hasDate(projects.find((p) => p.id === project.id)!);
          return (
            <div key={project.id} className="contents">
              <ScheduleRowHeader project={project} depth={depth} isProposedRow={isNewProposedRow} />
              {days.map((day) => (
                <div
                  key={day}
                  className="flex min-h-[86px] min-w-0 items-start overflow-hidden border-b border-l border-[var(--border-subtle)] p-1.5"
                  style={{ backgroundColor: isTodayISO(day) ? "var(--today-bg)" : undefined }}
                >
                  {project.workDays.includes(day) && (
                    <ProjectCard project={project} day={day} change={change} />
                  )}
                </div>
              ))}
            </div>
          );
        })}

        {rows.length === 0 && (
          <div
            className="col-span-full flex items-center justify-center py-16 text-sm text-[var(--muted)]"
            style={{ gridColumn: `1 / span ${days.length + 1}` }}
          >
            No scheduled projects match the current filters.
          </div>
        )}
      </div>
    </div>
  );
}
