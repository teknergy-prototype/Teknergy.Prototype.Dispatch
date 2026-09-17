"use client";

import { useState } from "react";
import { useDispatchStore } from "@/lib/store";
import type { EquipmentScope } from "@/lib/types";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";

const SCOPE_LABELS: Record<EquipmentScope, { title: string; desc: string }> = {
  project: { title: "Whole project (this day)", desc: "Applies to the project for this day only." },
  "member-day": { title: "Specific member (this day)", desc: "Applies to one crew member, this day only." },
  "member-whole-project": {
    title: "Specific member (whole project)",
    desc: "Applies to one crew member for every day of the project.",
  },
};

export function AssignEquipmentModal({
  projectId,
  equipmentId: presetEquipmentId,
  employeeId: presetEmployeeId,
  day,
}: {
  projectId: string;
  equipmentId: string;
  employeeId?: string;
  day: string;
}) {
  const closeModal = useDispatchStore((s) => s.closeModal);
  const assignEquipment = useDispatchStore((s) => s.assignEquipment);
  const project = useDispatchStore((s) => s.projects.find((p) => p.id === projectId));
  const equipment = useDispatchStore((s) => s.equipment);
  const employees = useDispatchStore((s) => s.employees);
  const crewAssignments = useDispatchStore((s) => s.crewAssignments);

  const [equipmentId, setEquipmentId] = useState(presetEquipmentId);
  const [scope, setScope] = useState<EquipmentScope>(presetEmployeeId ? "member-day" : "project");
  const [employeeId, setEmployeeId] = useState(presetEmployeeId ?? "");

  if (!project) return null;

  const isManualEquipment = presetEquipmentId === "";
  const crewOnDay = employees.filter((e) =>
    crewAssignments.some((a) => a.projectId === project.id && a.employeeId === e.id && a.day === day)
  );
  const employeeChoices = crewOnDay.length > 0 ? crewOnDay : employees;

  const needsEmployee = scope !== "project";
  const canConfirm = Boolean(equipmentId) && (!needsEmployee || Boolean(employeeId));

  function confirm() {
    if (!canConfirm) return;
    assignEquipment(equipmentId, scope, project!.id, needsEmployee ? employeeId : undefined, day);
    closeModal();
  }

  return (
    <Modal open onClose={closeModal} title="Assign equipment" width={460}>
      {isManualEquipment && (
        <div className="mb-3">
          <label className="mb-1 block text-[11px] font-medium text-[var(--muted)]">Equipment</label>
          <select
            value={equipmentId}
            onChange={(e) => setEquipmentId(e.target.value)}
            className="w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1.5 text-xs"
          >
            <option value="">Select equipment…</option>
            {equipment.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <p className="mb-2 text-xs text-[var(--muted)]">
        Assign {isManualEquipment ? "to" : <span className="font-medium text-[var(--foreground)]">{equipment.find((e) => e.id === equipmentId)?.name}</span>}{" "}
        on <span className="font-medium text-[var(--foreground)]">{project.name}</span> ({day}).
      </p>

      <label className="mb-1 block text-[11px] font-medium text-[var(--muted)]">Scope</label>
      <div className="flex flex-col gap-2">
        {(Object.keys(SCOPE_LABELS) as EquipmentScope[]).map((s) => (
          <label
            key={s}
            className="flex cursor-pointer items-start gap-2 rounded-md border border-[var(--border)] p-2 hover:bg-[var(--surface-hover)]"
          >
            <input
              type="radio"
              checked={scope === s}
              onChange={() => setScope(s)}
              className="mt-0.5 accent-[var(--foreground)]"
            />
            <span>
              <span className="block text-xs font-medium text-[var(--foreground)]">
                {SCOPE_LABELS[s].title}
              </span>
              <span className="block text-[11px] text-[var(--muted)]">{SCOPE_LABELS[s].desc}</span>
            </span>
          </label>
        ))}
      </div>

      {needsEmployee && (
        <div className="mt-2">
          <label className="mb-1 block text-[11px] font-medium text-[var(--muted)]">Crew member</label>
          <select
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            className="w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1.5 text-xs"
          >
            <option value="">Select an employee…</option>
            {employeeChoices.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="mt-4 flex justify-end gap-2">
        <Button variant="ghost" onClick={closeModal}>
          Cancel
        </Button>
        <Button variant="primary" onClick={confirm} disabled={!canConfirm}>
          Confirm
        </Button>
      </div>
    </Modal>
  );
}
