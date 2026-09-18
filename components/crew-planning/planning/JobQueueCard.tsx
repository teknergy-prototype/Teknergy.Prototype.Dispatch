"use client";

import { formatDuration, formatMinutes } from "@/lib/crew-planning/time";
import { useCrewPlanningStore } from "@/lib/crew-planning/store";
import type { Job, PlanRecommendation } from "@/lib/crew-planning/types";
import { Badge } from "../../ui/Badge";
import { Button } from "../../ui/Button";
import { GripIcon, LockIcon, SparkleIcon, WarningIcon } from "../../ui/Icons";

export function JobQueueCard({ job, proposal }: { job: Job; proposal?: PlanRecommendation }) {
  const crews = useCrewPlanningStore((s) => s.crews);
  const setSelectedJobId = useCrewPlanningStore((s) => s.setSelectedJobId);

  const proposedCrew = proposal?.crewTeamId ? crews.find((c) => c.id === proposal.crewTeamId) : undefined;

  return (
    <div
      className="flex flex-col gap-1.5 rounded-md border border-[var(--border-subtle)] bg-[var(--surface)] p-2.5 hover:border-[var(--border)] hover:shadow-sm"
      style={{ borderLeftWidth: 3, borderLeftColor: job.overdue ? "#dc2626" : "#a855f7" }}
    >
      <div className="flex items-start justify-between gap-2">
        <span
          onClick={() => setSelectedJobId(job.id)}
          className="min-w-0 cursor-pointer truncate text-xs font-semibold text-[var(--foreground)] hover:underline"
        >
          {job.customerName}
        </span>
        <span className="flex shrink-0 items-center gap-1 text-[var(--muted-2)]">
          {job.clientWindowLabel && (
            <span className="text-[10px] font-medium text-[var(--muted)]">{job.clientWindowLabel}</span>
          )}
          <GripIcon size={12} />
        </span>
      </div>
      <div className="truncate text-[11px] text-[var(--muted)]">{job.address}</div>
      <div className="flex flex-wrap items-center gap-1.5">
        <Badge className="bg-black/[0.05] text-[var(--foreground)] dark:bg-white/10">{job.serviceType}</Badge>
        <span className="text-[10px] text-[var(--muted-2)]">est. {formatDuration(job.durationMinutes)}</span>
        {job.accessNote && (
          <span className="flex items-center gap-0.5 text-[10px] text-[var(--muted-2)]">
            <LockIcon size={10} /> {job.accessNote}
          </span>
        )}
      </div>

      {job.overdue && (
        <div className="flex items-center gap-1 rounded-md bg-amber-50 px-2 py-1 text-[10px] font-medium text-amber-800 dark:bg-amber-950/30 dark:text-amber-400">
          <WarningIcon size={11} /> Overdue — carried from {job.overdueSince}, never assigned
        </div>
      )}
      {job.unassignedReason && (
        <div className="flex items-center gap-1 rounded-md bg-red-50 px-2 py-1 text-[10px] font-medium text-red-700 dark:bg-red-950/30 dark:text-red-400">
          <WarningIcon size={11} /> Unassigned — client window unreachable
        </div>
      )}
      {proposedCrew && proposal?.status !== "skipped" && (
        <div className="flex items-center gap-1 rounded-md bg-violet-50 px-2 py-1 text-[10px] font-medium text-violet-700 dark:bg-violet-950/30 dark:text-violet-300">
          <SparkleIcon size={11} /> In AI proposal · {proposedCrew.name} @ {formatMinutes(proposal!.startMinutes ?? 0)}
        </div>
      )}

      <Button
        variant="secondary"
        className="mt-0.5 w-full py-1 text-[11px]"
        onClick={(e) => {
          e.stopPropagation();
          setSelectedJobId(job.id);
        }}
      >
        Assign
      </Button>
    </div>
  );
}
