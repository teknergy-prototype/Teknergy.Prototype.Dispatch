"use client";

import { useState } from "react";
import { useDispatchStore } from "@/lib/store";
import { hasDate } from "@/lib/queue";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";

export function AddRouteStopModal({
  employeeId,
  day,
  projectId: presetProjectId,
}: {
  employeeId: string;
  day: string;
  projectId?: string;
}) {
  const closeModal = useDispatchStore((s) => s.closeModal);
  const addRouteStop = useDispatchStore((s) => s.addRouteStop);
  const projects = useDispatchStore((s) => s.projects);
  const employees = useDispatchStore((s) => s.employees);
  const routeTypes = useDispatchStore((s) => s.routeTypes);

  const [projectId, setProjectId] = useState(presetProjectId ?? "");
  const [routeTypeId, setRouteTypeId] = useState(routeTypes[0]?.id ?? "");

  const employee = employees.find((e) => e.id === employeeId);
  const datedProjects = projects.filter(hasDate);

  return (
    <Modal open onClose={closeModal} title="Add route stop">
      <p className="mb-3 text-xs text-[var(--muted)]">
        Add a stop for <span className="font-medium text-[var(--foreground)]">{employee?.name}</span> on{" "}
        <span className="font-medium text-[var(--foreground)]">{day}</span>.
      </p>

      <label className="mb-3 block">
        <span className="mb-1 block text-[11px] font-medium text-[var(--muted)]">Project</span>
        <select
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
          className="w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1.5 text-xs"
        >
          <option value="">Select a project…</option>
          {datedProjects.map((p) => (
            <option key={p.id} value={p.id}>
              #{p.id} {p.name}
            </option>
          ))}
        </select>
      </label>

      <label className="mb-1 block">
        <span className="mb-1 block text-[11px] font-medium text-[var(--muted)]">Route type</span>
        <select
          value={routeTypeId}
          onChange={(e) => setRouteTypeId(e.target.value)}
          className="w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1.5 text-xs"
        >
          {routeTypes.map((rt) => (
            <option key={rt.id} value={rt.id}>
              {rt.name}
            </option>
          ))}
        </select>
      </label>

      <div className="mt-4 flex justify-end gap-2">
        <Button variant="ghost" onClick={closeModal}>
          Cancel
        </Button>
        <Button
          variant="primary"
          disabled={!projectId || !routeTypeId}
          onClick={() => {
            addRouteStop(employeeId, projectId, day, routeTypeId);
            closeModal();
          }}
        >
          Add stop
        </Button>
      </div>
    </Modal>
  );
}
