"use client";

import { useState } from "react";
import { useCrewPlanningStore } from "@/lib/crew-planning/store";
import { formatDuration } from "@/lib/crew-planning/time";
import { Modal } from "../../ui/Modal";
import { Button } from "../../ui/Button";

function minutesToTimeInput(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function timeInputToMinutes(value: string): number {
  const [h, m] = value.split(":").map(Number);
  return h * 60 + m;
}

export function AssignJobModal({ jobId, onClose }: { jobId: string; onClose: () => void }) {
  const job = useCrewPlanningStore((s) => s.jobs.find((j) => j.id === jobId));
  const crews = useCrewPlanningStore((s) => s.crews);
  const assignJob = useCrewPlanningStore((s) => s.assignJob);
  const [crewId, setCrewId] = useState(crews[0]?.id ?? "");
  const [time, setTime] = useState(minutesToTimeInput(9 * 60));

  if (!job) return null;

  return (
    <Modal open onClose={onClose} title="Assign Job">
      <p className="mb-3 text-xs text-[var(--muted)]">
        Assign <span className="font-medium text-[var(--foreground)]">{job.customerName}</span> ({formatDuration(job.durationMinutes)}) to a crew.
      </p>

      <label className="mb-3 block">
        <span className="mb-1 block text-[11px] font-medium text-[var(--muted)]">Crew</span>
        <select
          value={crewId}
          onChange={(e) => setCrewId(e.target.value)}
          className="w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1.5 text-xs"
        >
          {crews.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </label>

      <label className="mb-1 block">
        <span className="mb-1 block text-[11px] font-medium text-[var(--muted)]">Start time</span>
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1.5 text-xs"
        />
      </label>

      <div className="mt-4 flex justify-end gap-2">
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={() => {
            assignJob(job.id, crewId, timeInputToMinutes(time));
            onClose();
          }}
        >
          Assign
        </Button>
      </div>
    </Modal>
  );
}
