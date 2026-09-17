"use client";

import { getStatusColor } from "@/lib/colors";
import { hasDate, isOverdue, isProjectLocked } from "@/lib/queue";
import { useDispatchStore } from "@/lib/store";
import { Modal } from "../ui/Modal";
import { Badge } from "../ui/Badge";
import { Avatar } from "../ui/Avatar";
import { Button } from "../ui/Button";
import { LockIcon } from "../ui/Icons";

export function ProjectDetailModal({ projectId }: { projectId: string }) {
  const closeModal = useDispatchStore((s) => s.closeModal);
  const openModal = useDispatchStore((s) => s.openModal);
  const projects = useDispatchStore((s) => s.projects);
  const employees = useDispatchStore((s) => s.employees);
  const equipmentCatalog = useDispatchStore((s) => s.equipment);
  const crewAssignments = useDispatchStore((s) => s.crewAssignments);
  const equipmentAssignments = useDispatchStore((s) => s.equipmentAssignments);

  const project = projects.find((p) => p.id === projectId);
  if (!project) return null;

  const projectsById = new Map(projects.map((p) => [p.id, p]));
  const locked = isProjectLocked(project, projectsById);
  const statusColor = getStatusColor(project.status);
  const parent = project.parentProjectId ? projectsById.get(project.parentProjectId) : undefined;
  const children = projects.filter((p) => p.parentProjectId === project.id);

  const crewIds = Array.from(
    new Set(crewAssignments.filter((a) => a.projectId === project.id).map((a) => a.employeeId))
  );
  const equipIds = Array.from(
    new Set(equipmentAssignments.filter((a) => a.projectId === project.id).map((a) => a.equipmentId))
  );

  return (
    <Modal open onClose={closeModal} title={`#${project.id} ${project.name}`} width={480}>
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge bg={statusColor.bg} text={statusColor.text}>
            {project.status}
          </Badge>
          <Badge className="bg-black/[0.05] text-[var(--foreground)] dark:bg-white/10">
            {project.serviceCategory.name}
          </Badge>
          {locked && (
            <Badge className="flex items-center gap-1 bg-[#adb5bd]/20 text-[#6b7280]">
              <LockIcon size={11} /> Estimate not signed
            </Badge>
          )}
          {!hasDate(project) && <Badge className="bg-gray-100 text-gray-500 dark:bg-white/10">No date</Badge>}
          {hasDate(project) && isOverdue(project) && (
            <Badge className="bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400">Overdue</Badge>
          )}
        </div>

        {parent && (
          <div className="text-xs text-[var(--muted)]">
            Subproject of{" "}
            <button
              className="font-medium text-[var(--foreground)] hover:underline"
              onClick={() => openModal({ type: "project-detail", projectId: parent.id })}
            >
              #{parent.id} {parent.name}
            </button>
          </div>
        )}

        <div className="grid grid-cols-2 gap-x-4 gap-y-2 rounded-md border border-[var(--border-subtle)] p-3 text-xs">
          <div>
            <div className="text-[10px] uppercase tracking-wide text-[var(--muted-2)]">Address</div>
            <div className="text-[var(--foreground)]">
              {project.address.street}, {project.address.city}, {project.address.state} {project.address.zip}
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wide text-[var(--muted-2)]">Dates</div>
            <div className="text-[var(--foreground)]">
              {project.beginDate ? `${project.beginDate} → ${project.endDate}` : "Not scheduled"}
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wide text-[var(--muted-2)]">Work days</div>
            <div className="text-[var(--foreground)]">{project.workDays.length || "—"}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wide text-[var(--muted-2)]">Estimate</div>
            <div className="text-[var(--foreground)]">
              {project.hasSignedEstimate ? "Signed" : "Not signed"}
            </div>
          </div>
        </div>

        {crewIds.length > 0 && (
          <div>
            <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--muted-2)]">
              Crew assigned
            </div>
            <div className="flex flex-wrap gap-2">
              {crewIds.map((id) => {
                const e = employees.find((emp) => emp.id === id);
                if (!e) return null;
                return (
                  <span
                    key={id}
                    className="flex items-center gap-1.5 rounded-full border border-[var(--border-subtle)] py-0.5 pl-0.5 pr-2 text-[11px]"
                  >
                    <Avatar name={e.name} color={e.avatarColor} size={18} />
                    {e.name}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {equipIds.length > 0 && (
          <div>
            <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--muted-2)]">
              Equipment assigned
            </div>
            <div className="flex flex-wrap gap-1.5">
              {equipIds.map((id) => {
                const e = equipmentCatalog.find((eq) => eq.id === id);
                if (!e) return null;
                return (
                  <Badge key={id} className="bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400">
                    {e.name}
                  </Badge>
                );
              })}
            </div>
          </div>
        )}

        {children.length > 0 && (
          <div>
            <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--muted-2)]">
              Subprojects
            </div>
            <div className="flex flex-col gap-1">
              {children.map((c) => (
                <button
                  key={c.id}
                  onClick={() => openModal({ type: "project-detail", projectId: c.id })}
                  className="text-left text-xs text-[var(--foreground)] hover:underline"
                >
                  #{c.id} {c.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 border-t border-[var(--border-subtle)] pt-3">
          <Button variant="ghost" onClick={() => openModal({ type: "history", projectId: project.id })}>
            View history
          </Button>
          <Button
            variant="primary"
            onClick={() =>
              locked
                ? openModal({ type: "locked-notice", projectName: project.name })
                : openModal({ type: "schedule-project", projectId: project.id, day: project.beginDate ?? "" })
            }
          >
            {hasDate(project) ? "Reschedule" : "Schedule"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
