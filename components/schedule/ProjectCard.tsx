"use client";

import { getStatusColor } from "@/lib/colors";
import { isEmployeeOffOn } from "@/lib/availability";
import { isProjectLocked } from "@/lib/queue";
import { crewForCell, equipmentForCell } from "@/lib/scheduleHelpers";
import { useDispatchStore } from "@/lib/store";
import { cn } from "@/lib/cn";
import type { ISODate, Project, ProposedChange } from "@/lib/types";
import { Droppable } from "../dnd/Droppable";
import { Avatar } from "../ui/Avatar";
import { Badge } from "../ui/Badge";
import { Menu } from "../ui/Menu";
import { LockIcon, TrashIcon, XIcon } from "../ui/Icons";

export function ProjectCard({
  project,
  day,
  change,
}: {
  project: Project;
  day: ISODate;
  change?: ProposedChange;
}) {
  const projects = useDispatchStore((s) => s.projects);
  const employees = useDispatchStore((s) => s.employees);
  const equipmentCatalog = useDispatchStore((s) => s.equipment);
  const crewAssignments = useDispatchStore((s) => s.crewAssignments);
  const equipmentAssignments = useDispatchStore((s) => s.equipmentAssignments);
  const draggingItem = useDispatchStore((s) => s.draggingItem);
  const availabilityEntries = useDispatchStore((s) => s.availabilityEntries);
  const openModal = useDispatchStore((s) => s.openModal);
  const removeCrew = useDispatchStore((s) => s.removeCrew);
  const removeEquipmentAssignment = useDispatchStore((s) => s.removeEquipmentAssignment);
  const removeWorkDay = useDispatchStore((s) => s.removeWorkDay);
  const extendDay = useDispatchStore((s) => s.extendDay);
  const highlightedChangeId = useDispatchStore((s) => s.highlightedChangeId);
  const setHighlightedChangeId = useDispatchStore((s) => s.setHighlightedChangeId);

  const projectsById = new Map(projects.map((p) => [p.id, p]));
  const locked = isProjectLocked(project, projectsById);
  const statusColor = getStatusColor(project.status);

  const isProposed = Boolean(change) && change!.proposedDay === day && change!.status !== "rejected";
  const realCrew = crewForCell(crewAssignments, project.id, day);
  const crew = isProposed
    ? change!.proposedCrewIds
        .map((id) => ({ employeeId: id }))
        .filter((c) => employees.some((e) => e.id === c.employeeId))
    : realCrew;
  const equip = isProposed ? [] : equipmentForCell(equipmentAssignments, project.id, day);
  const isHighlighted = isProposed && highlightedChangeId === change!.id;

  function guardOrRun(fn: () => void) {
    if (locked) {
      openModal({ type: "locked-notice", projectName: project.name });
      return;
    }
    fn();
  }

  function handleCardClick() {
    if (!isProposed) {
      openModal({ type: "project-detail", projectId: project.id });
      return;
    }
    const next = isHighlighted ? null : change!.id;
    setHighlightedChangeId(next);
    if (next) {
      document
        .getElementById(`recommendation-${change!.id}`)
        ?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }

  const cardBlocked =
    draggingItem !== null &&
    (locked ||
      isProposed ||
      draggingItem.kind === "project" ||
      (draggingItem.kind === "crew" && isEmployeeOffOn(availabilityEntries, draggingItem.employee.id, day)));

  return (
    <Droppable
      id={`project-card-${project.id}-${day}`}
      data={{ kind: "project-card", projectId: project.id, day }}
      isBlocked={cardBlocked}
      disabled={isProposed}
      className="w-full min-w-0 rounded-md"
    >
      <div
        id={isProposed ? `proposed-card-${change!.id}` : undefined}
        onClick={handleCardClick}
        className={cn(
          "flex w-full min-w-0 cursor-pointer flex-col gap-1.5 rounded-md border p-2 shadow-sm transition-colors",
          isProposed
            ? isHighlighted
              ? "border-violet-500 bg-violet-100 ring-2 ring-violet-500 dark:border-violet-400 dark:bg-violet-900/40 dark:ring-violet-400"
              : "border-violet-300 bg-violet-50 ring-1 ring-violet-300 dark:border-violet-800 dark:bg-violet-950/20 dark:ring-violet-800"
            : "border-[var(--border-subtle)] bg-[var(--surface)] hover:border-[var(--border)]",
          locked && "opacity-60 grayscale-[0.4]"
        )}
        style={{ borderLeftWidth: 3, borderLeftColor: isProposed ? "#8b5cf6" : project.serviceCategory.color }}
      >
        <div className="flex min-w-0 items-start gap-1">
          <span className="min-w-0 flex-1 truncate text-xs font-semibold text-[var(--foreground)]">
            {project.name}
          </span>
          {locked && <LockIcon size={12} className="mt-0.5 shrink-0 text-[#adb5bd]" />}
          {!isProposed && (
            <Menu
              items={[
                {
                  label: "Assign Crew",
                  onClick: () =>
                    guardOrRun(() => openModal({ type: "assign-crew", projectId: project.id, employeeId: "", day })),
                },
                {
                  label: "Assign Equipment",
                  onClick: () =>
                    guardOrRun(() =>
                      openModal({ type: "assign-equipment", projectId: project.id, equipmentId: "", day })
                    ),
                },
                { label: "Extend day", onClick: () => guardOrRun(() => extendDay(project.id)) },
                {
                  label: "Remove day",
                  danger: true,
                  icon: <TrashIcon size={13} />,
                  onClick: () => guardOrRun(() => removeWorkDay(project.id, day)),
                },
                { label: "History", onClick: () => openModal({ type: "history", projectId: project.id }) },
              ]}
            />
          )}
        </div>
        <div className="truncate text-[10px] text-[var(--muted)]">
          #{project.id} · {project.address.street}
        </div>
        <div className="flex flex-wrap items-center gap-1">
          <Badge bg={statusColor.bg} text={statusColor.text} className="w-fit">
            {project.status}
          </Badge>
          {isProposed && (
            <Badge
              className={
                change!.status === "accepted"
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300"
                  : "bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300"
              }
            >
              {change!.status === "accepted" ? "Accepted" : "Proposed"}
            </Badge>
          )}
        </div>

        {crew.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {crew.map((c) => {
              const employee = employees.find((e) => e.id === c.employeeId);
              if (!employee) return null;
              if (isProposed) {
                return (
                  <span
                    key={c.employeeId}
                    className="flex items-center gap-1 rounded-full border border-violet-200 bg-white/70 py-0.5 pl-0.5 pr-1.5 dark:border-violet-800 dark:bg-white/5"
                  >
                    <Avatar name={employee.name} color={employee.avatarColor} size={16} />
                    <span className="text-[10px] font-medium text-[var(--foreground)]">
                      {employee.name.split(" ")[0]}
                    </span>
                  </span>
                );
              }
              const chipBlocked =
                draggingItem !== null && draggingItem.kind !== "equipment";
              return (
                <Droppable
                  key={c.employeeId}
                  id={`crew-chip-${project.id}-${c.employeeId}-${day}`}
                  data={{ kind: "crew-chip", projectId: project.id, employeeId: c.employeeId, day }}
                  isBlocked={locked || chipBlocked}
                >
                  <span className="group/chip flex items-center gap-1 rounded-full border border-[var(--border-subtle)] bg-[var(--surface-hover)] py-0.5 pl-0.5 pr-1.5">
                    <Avatar name={employee.name} color={employee.avatarColor} size={16} />
                    <span className="text-[10px] font-medium text-[var(--foreground)]">
                      {employee.name.split(" ")[0]}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        guardOrRun(() => removeCrew(project.id, c.employeeId, day));
                      }}
                      className="hidden text-[var(--muted-2)] hover:text-red-600 group-hover/chip:inline"
                    >
                      <XIcon size={10} />
                    </button>
                  </span>
                </Droppable>
              );
            })}
          </div>
        )}

        {equip.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {equip.map((a) => {
              const item = equipmentCatalog.find((e) => e.id === a.equipmentId);
              if (!item) return null;
              const memberScoped = a.scope !== "project";
              const employeeName = memberScoped
                ? employees.find((e) => e.id === a.employeeId)?.name.split(" ")[0]
                : null;
              return (
                <span
                  key={a.id}
                  className={`group/chip flex items-center gap-1 rounded-full py-0.5 pl-1.5 pr-1 text-[10px] font-medium ${
                    memberScoped
                      ? "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400"
                      : "bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-300"
                  }`}
                >
                  {item.name}
                  {employeeName ? ` · ${employeeName}` : ""}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      guardOrRun(() => removeEquipmentAssignment(a.id));
                    }}
                    className="hidden hover:text-red-600 group-hover/chip:inline"
                  >
                    <XIcon size={10} />
                  </button>
                </span>
              );
            })}
          </div>
        )}
      </div>
    </Droppable>
  );
}
