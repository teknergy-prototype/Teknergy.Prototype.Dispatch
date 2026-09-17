"use client";

import { useState } from "react";
import { useDispatchStore } from "@/lib/store";
import { today } from "@/lib/dates";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";

/** Mounted only while a "schedule-project" modal is active — see ModalsRoot. */
export function ScheduleProjectModal({ projectId, day: initialDay }: { projectId: string; day: string }) {
  const closeModal = useDispatchStore((s) => s.closeModal);
  const scheduleProject = useDispatchStore((s) => s.scheduleProject);
  const project = useDispatchStore((s) => s.projects.find((p) => p.id === projectId));
  const [mode, setMode] = useState<"add" | "reschedule">("add");
  const [day, setDay] = useState(initialDay || today());

  if (!project) return null;

  const hasExisting = project.workDays.length > 0;

  return (
    <Modal open onClose={closeModal} title="Schedule project">
      <p className="mb-3 text-xs text-[var(--muted)]">
        Schedule <span className="font-medium text-[var(--foreground)]">{project.name}</span>.
      </p>

      <label className="mb-3 block">
        <span className="mb-1 block text-[11px] font-medium text-[var(--muted)]">Date</span>
        <input
          type="date"
          value={day}
          onChange={(e) => setDay(e.target.value)}
          className="w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1.5 text-xs"
        />
      </label>

      <div className="flex flex-col gap-2">
        <label className="flex cursor-pointer items-start gap-2 rounded-md border border-[var(--border)] p-2.5 hover:bg-[var(--surface-hover)]">
          <input
            type="radio"
            checked={mode === "add"}
            onChange={() => setMode("add")}
            className="mt-0.5 accent-[var(--foreground)]"
          />
          <span>
            <span className="block text-xs font-medium text-[var(--foreground)]">Add work day</span>
            <span className="block text-[11px] text-[var(--muted)]">
              Keep existing work days and add this one to the schedule.
            </span>
          </span>
        </label>
        <label className="flex cursor-pointer items-start gap-2 rounded-md border border-[var(--border)] p-2.5 hover:bg-[var(--surface-hover)]">
          <input
            type="radio"
            checked={mode === "reschedule"}
            onChange={() => setMode("reschedule")}
            disabled={!hasExisting}
            className="mt-0.5 accent-[var(--foreground)]"
          />
          <span>
            <span className="block text-xs font-medium text-[var(--foreground)]">Reschedule</span>
            <span className="block text-[11px] text-[var(--muted)]">
              Replace all existing work days with this single date.
            </span>
          </span>
        </label>
      </div>

      <div className="mt-4 flex justify-end gap-2">
        <Button variant="ghost" onClick={closeModal}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={() => {
            scheduleProject(project.id, day, mode);
            closeModal();
          }}
          disabled={!day}
        >
          Confirm
        </Button>
      </div>
    </Modal>
  );
}
