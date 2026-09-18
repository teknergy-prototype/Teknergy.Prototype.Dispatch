"use client";

import { useState } from "react";
import { useCrewPlanningStore } from "@/lib/crew-planning/store";
import { formatMinutes } from "@/lib/crew-planning/time";
import { LockIcon, MapPinIcon, PhoneIcon } from "../../ui/Icons";

export function CustomerAccessPanel({ jobId }: { jobId?: string }) {
  const job = useCrewPlanningStore((s) => s.jobs.find((j) => j.id === jobId));
  const [revealed, setRevealed] = useState(false);

  if (!job) {
    return (
      <div className="rounded-md border border-[var(--border-subtle)] p-3 text-[11px] text-[var(--muted)]">
        Select a job in the itinerary to see access details.
      </div>
    );
  }

  return (
    <div className="rounded-md border border-[var(--border-subtle)] p-3">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-[10px] font-semibold uppercase tracking-wide text-red-600 dark:text-red-400">
          Customer access &amp; instructions
        </h3>
        {job.scheduledStartMinutes != null && (
          <span className="text-[10px] text-[var(--muted-2)]">
            {formatMinutes(job.scheduledStartMinutes)} – {formatMinutes(job.scheduledEndMinutes!)}
          </span>
        )}
      </div>
      <div className="text-sm font-semibold text-[var(--foreground)]">{job.customerName}</div>
      <div className="mb-2 text-[11px] text-[var(--muted)]">
        Job #{job.id} · {job.serviceType}
      </div>
      <div className="flex flex-col gap-1.5 text-[11px] text-[var(--foreground)]">
        <div className="flex items-start gap-1.5">
          <MapPinIcon size={12} className="mt-0.5 shrink-0 text-[var(--muted-2)]" />
          {job.address}
        </div>
        {job.phone && (
          <div className="flex items-center gap-1.5">
            <PhoneIcon size={12} className="shrink-0 text-[var(--muted-2)]" />
            {job.phone} {job.contactName ? `· ${job.contactName}` : ""}
          </div>
        )}
        {job.serviceInstructions && <p className="text-[var(--muted)]">{job.serviceInstructions}</p>}
      </div>

      {job.accessCode && (
        <div className="mt-2 flex items-center gap-1.5 rounded-md border border-[var(--border-subtle)] px-2.5 py-1.5">
          <LockIcon size={12} className="text-[var(--muted-2)]" />
          <span className="text-xs text-[var(--muted)]">Gate code:</span>
          <span className="font-mono text-xs font-medium text-[var(--foreground)]">{revealed ? job.accessCode : "••••"}</span>
          <button onClick={() => setRevealed((r) => !r)} className="ml-auto text-[11px] font-medium text-blue-600 hover:underline">
            {revealed ? "Hide" : "Reveal"}
          </button>
        </div>
      )}

      <p className="mt-2 text-[10px] text-[var(--muted-2)]">Access details are shown only to assigned crew members.</p>
    </div>
  );
}
