"use client";

import { useState } from "react";
import { useDispatchStore } from "@/lib/store";
import { isEmployeeOffOn } from "@/lib/availability";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { Avatar } from "../ui/Avatar";

export function AssignCrewModal({
  projectId,
  employeeId: presetEmployeeId,
  day,
}: {
  projectId: string;
  employeeId: string;
  day: string;
}) {
  const closeModal = useDispatchStore((s) => s.closeModal);
  const assignCrew = useDispatchStore((s) => s.assignCrew);
  const project = useDispatchStore((s) => s.projects.find((p) => p.id === projectId));
  const employees = useDispatchStore((s) => s.employees);
  const availabilityEntries = useDispatchStore((s) => s.availabilityEntries);
  const [pickedId, setPickedId] = useState("");

  if (!project) return null;

  const isManual = presetEmployeeId === "";
  const employeeId = isManual ? pickedId : presetEmployeeId;
  const employee = employees.find((e) => e.id === employeeId);
  const dayOff = employee ? isEmployeeOffOn(availabilityEntries, employee.id, day) : false;

  function confirm() {
    if (!employeeId) return;
    assignCrew(project!.id, employeeId, day);
    closeModal();
  }

  return (
    <Modal open onClose={closeModal} title="Assign crew">
      {isManual ? (
        <div className="mb-3">
          <label className="mb-1 block text-[11px] font-medium text-[var(--muted)]">
            Crew member
          </label>
          <select
            value={pickedId}
            onChange={(e) => setPickedId(e.target.value)}
            className="w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1.5 text-xs"
          >
            <option value="">Select an employee…</option>
            {employees.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name}
              </option>
            ))}
          </select>
        </div>
      ) : (
        employee && (
          <div className="mb-3 flex items-center gap-2 rounded-md border border-[var(--border)] p-2">
            <Avatar name={employee.name} color={employee.avatarColor} />
            <span className="text-xs font-medium">{employee.name}</span>
          </div>
        )
      )}

      <p className="text-xs text-[var(--muted)]">
        Assign to <span className="font-medium text-[var(--foreground)]">{project.name}</span> on{" "}
        <span className="font-medium text-[var(--foreground)]">{day}</span>?
      </p>

      {dayOff && (
        <p className="mt-2 rounded-md bg-red-50 px-2 py-1.5 text-[11px] text-red-700 dark:bg-red-950/40 dark:text-red-400">
          Heads up — this employee has a day off on {day}.
        </p>
      )}

      <div className="mt-4 flex justify-end gap-2">
        <Button variant="ghost" onClick={closeModal}>
          Cancel
        </Button>
        <Button variant="primary" onClick={confirm} disabled={!employeeId}>
          Confirm
        </Button>
      </div>
    </Modal>
  );
}
