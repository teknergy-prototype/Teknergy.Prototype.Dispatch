"use client";

import { getStatusColor } from "@/lib/colors";
import { isProjectLocked } from "@/lib/queue";
import { useDispatchStore } from "@/lib/store";
import type { Project } from "@/lib/types";
import { Badge } from "../ui/Badge";
import { LockIcon } from "../ui/Icons";

export function ScheduleRowHeader({
  project,
  depth,
  isProposedRow,
}: {
  project: Project;
  depth: number;
  isProposedRow?: boolean;
}) {
  const projects = useDispatchStore((s) => s.projects);
  const openModal = useDispatchStore((s) => s.openModal);
  const projectsById = new Map(projects.map((p) => [p.id, p]));
  const locked = isProjectLocked(project, projectsById);
  const statusColor = getStatusColor(project.status);

  return (
    <div
      className={`sticky left-0 z-[5] flex min-w-0 flex-col justify-center gap-1 border-b border-l border-[var(--border-subtle)] px-3 py-2 ${
        locked ? "opacity-60" : ""
      } ${isProposedRow ? "bg-violet-50 dark:bg-violet-950/20" : "bg-[var(--surface)]"}`}
      style={{
        borderLeftWidth: depth === 0 ? 3 : undefined,
        borderLeftColor: depth === 0 ? project.serviceCategory.color : undefined,
        marginLeft: depth > 0 ? 14 : 0,
        borderLeftStyle: depth > 0 ? "dashed" : "solid",
      }}
    >
      <div className="flex items-center gap-1">
        <button
          onClick={() => openModal({ type: "project-detail", projectId: project.id })}
          className="min-w-0 flex-1 truncate text-left text-xs font-medium text-[var(--foreground)] hover:underline"
          title={project.name}
        >
          #{project.id} {project.name}
        </button>
        {locked && <LockIcon size={12} className="shrink-0 text-[#adb5bd]" />}
      </div>
      <div className="truncate text-[10px] text-[var(--muted)]">{project.address.street}</div>
      <Badge bg={statusColor.bg} text={statusColor.text} className="w-fit">
        {project.status}
      </Badge>
    </div>
  );
}
