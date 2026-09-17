"use client";

import { useDispatchStore } from "@/lib/store";
import { Modal } from "../ui/Modal";

export function HistoryModal({ projectId }: { projectId: string }) {
  const closeModal = useDispatchStore((s) => s.closeModal);
  const projects = useDispatchStore((s) => s.projects);
  const employees = useDispatchStore((s) => s.employees);
  const equipmentCatalog = useDispatchStore((s) => s.equipment);
  const crewAssignments = useDispatchStore((s) => s.crewAssignments);
  const equipmentAssignments = useDispatchStore((s) => s.equipmentAssignments);

  const project = projects.find((p) => p.id === projectId);
  if (!project) return null;

  const days = [...project.workDays].sort();

  const events = [
    { at: project.beginDate ?? "—", label: "Project created", detail: project.status },
    ...days.map((day) => {
      const crew = crewAssignments
        .filter((a) => a.projectId === project.id && a.day === day)
        .map((a) => employees.find((e) => e.id === a.employeeId)?.name)
        .filter(Boolean);
      const equip = equipmentAssignments
        .filter((a) => a.projectId === project.id && (a.day === day || a.scope === "member-whole-project"))
        .map((a) => equipmentCatalog.find((e) => e.id === a.equipmentId)?.name)
        .filter(Boolean);
      const parts = [
        crew.length ? `Crew: ${crew.join(", ")}` : null,
        equip.length ? `Equipment: ${equip.join(", ")}` : null,
      ].filter(Boolean);
      return { at: day, label: "Work day scheduled", detail: parts.join(" · ") || "No assignments yet" };
    }),
  ];

  return (
    <Modal open onClose={closeModal} title={`History — ${project.name}`} width={480}>
      <div className="max-h-96 overflow-y-auto">
        <ol className="flex flex-col gap-3">
          {events.map((ev, i) => (
            <li key={i} className="flex gap-3">
              <div className="flex flex-col items-center pt-0.5">
                <span className="h-2 w-2 shrink-0 rounded-full bg-[var(--foreground)]" />
                {i < events.length - 1 && <span className="mt-1 w-px flex-1 bg-[var(--border)]" />}
              </div>
              <div className="pb-1">
                <div className="text-[11px] font-medium text-[var(--muted)]">{ev.at}</div>
                <div className="text-xs font-medium text-[var(--foreground)]">{ev.label}</div>
                <div className="text-[11px] text-[var(--muted)]">{ev.detail}</div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </Modal>
  );
}
