"use client";

import { useDispatchStore } from "@/lib/store";
import { getStatusColor } from "@/lib/colors";
import { hasDate, isOverdue, isProjectLocked } from "@/lib/queue";
import type { Project } from "@/lib/types";
import { Draggable } from "../dnd/Draggable";
import { Badge } from "../ui/Badge";
import { GripIcon, LockIcon } from "../ui/Icons";

export function ProjectQueueCard({
  project,
  indented,
}: {
  project: Project;
  indented?: boolean;
}) {
  const projects = useDispatchStore((s) => s.projects);
  const openModal = useDispatchStore((s) => s.openModal);
  const projectsById = new Map(projects.map((p) => [p.id, p]));
  const locked = isProjectLocked(project, projectsById);
  const statusColor = getStatusColor(project.status);
  const dated = hasDate(project);
  const overdue = isOverdue(project);

  const card = (
    <div
      className={`group relative flex flex-col gap-1 rounded-md border border-[var(--border-subtle)] bg-[var(--surface)] py-2 pl-2.5 pr-2 hover:border-[var(--border)] hover:shadow-sm ${
        indented ? "ml-3 border-l-2 border-dashed border-l-[var(--border)]" : ""
      } ${locked ? "opacity-60" : ""}`}
      style={{ borderLeftWidth: indented ? undefined : 3, borderLeftColor: indented ? undefined : project.serviceCategory.color }}
    >
      <div className="flex items-start gap-1.5">
        <button
          onClick={() => openModal({ type: "project-detail", projectId: project.id })}
          className="flex-1 truncate text-left text-xs font-medium text-[var(--foreground)] hover:underline"
        >
          #{project.id} {project.name}
        </button>
        {locked && <LockIcon size={12} className="mt-0.5 shrink-0 text-[#adb5bd]" />}
        <span className="mt-0.5 shrink-0 cursor-grab text-[var(--muted-2)] active:cursor-grabbing">
          <GripIcon size={13} />
        </span>
      </div>
      <div className="truncate text-[11px] text-[var(--muted)]">{project.address.street}, {project.address.city}</div>
      <div className="flex flex-wrap items-center gap-1.5">
        <Badge bg={project.statusColor ? undefined : statusColor.bg} text={project.statusColor ?? statusColor.text}>
          {project.status}
        </Badge>
        {!dated && <Badge className="bg-gray-100 text-gray-500 dark:bg-white/10 dark:text-gray-400">No date</Badge>}
        {dated && overdue && (
          <Badge className="bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400">⚠ Overdue</Badge>
        )}
        {dated && !overdue && (
          <Badge className="bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
            📅 {project.beginDate}
          </Badge>
        )}
        <button
          onClick={() =>
            openModal({ type: "schedule-project", projectId: project.id, day: project.beginDate ?? "" })
          }
          disabled={locked}
          className="ml-auto rounded-md border border-[var(--border)] px-1.5 py-0.5 text-[10px] font-medium hover:bg-[var(--surface-hover)] disabled:opacity-40"
        >
          Schedule
        </button>
      </div>
    </div>
  );

  return (
    <Draggable id={`queue-project-${project.id}`} data={{ kind: "project", project }} disabled={locked}>
      {card}
    </Draggable>
  );
}
