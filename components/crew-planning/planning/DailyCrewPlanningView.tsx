"use client";

import { useCrewPlanningStore } from "@/lib/crew-planning/store";
import { ChevronLeftIcon, ChevronRightIcon, RefreshIcon, SparkleIcon } from "../../ui/Icons";
import { Button } from "../../ui/Button";
import { UnplannedJobsPanel } from "./UnplannedJobsPanel";
import { CrewScheduleTimeline } from "./CrewScheduleTimeline";
import { AIPlanPanel } from "./AIPlanPanel";
import { JobDetailDrawer } from "./JobDetailDrawer";

export function DailyCrewPlanningView() {
  const dateLabel = useCrewPlanningStore((s) => s.dateLabel);
  const syncStatus = useCrewPlanningStore((s) => s.syncStatus);
  const lastSyncedLabel = useCrewPlanningStore((s) => s.lastSyncedLabel);
  const syncJobber = useCrewPlanningStore((s) => s.syncJobber);
  const generateStatus = useCrewPlanningStore((s) => s.generateStatus);
  const generatePlan = useCrewPlanningStore((s) => s.generatePlan);
  const selectedJobId = useCrewPlanningStore((s) => s.selectedJobId);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex flex-wrap items-center gap-3 border-b border-[var(--border-subtle)] px-4 py-3">
        <div className="min-w-0">
          <h1 className="text-sm font-semibold text-[var(--foreground)]">Daily Crew Planning</h1>
          <p className="text-xs text-[var(--muted)]">Jobber-connected operational scheduling</p>
        </div>

        <div className="ml-2 flex items-center gap-1 rounded-md border border-[var(--border)] px-2 py-1.5">
          <button className="text-[var(--muted-2)] disabled:opacity-40" disabled aria-label="Previous day">
            <ChevronLeftIcon size={14} />
          </button>
          <span className="px-1 text-xs font-medium text-[var(--foreground)]">{dateLabel}</span>
          <button className="text-[var(--muted-2)] disabled:opacity-40" disabled aria-label="Next day">
            <ChevronRightIcon size={14} />
          </button>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Button variant="secondary" className="text-xs" onClick={syncJobber} disabled={syncStatus === "syncing"}>
            <RefreshIcon size={13} className={syncStatus === "syncing" ? "animate-spin" : ""} />
            {syncStatus === "syncing" ? "Syncing…" : "Sync Jobber appointments"}
          </Button>
          <Button variant="primary" className="text-xs" onClick={generatePlan} disabled={generateStatus === "generating"}>
            <SparkleIcon size={13} />
            {generateStatus === "generating" ? "Generating…" : "Generate daily crew plan"}
          </Button>
        </div>

        <div className="w-full text-right text-[11px] text-[var(--muted-2)]">
          <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 align-middle" />
          Jobber connected · Last synced {lastSyncedLabel}
        </div>
      </div>

      <div className="flex min-h-0 flex-1">
        <UnplannedJobsPanel />
        <CrewScheduleTimeline />
        <AIPlanPanel />
      </div>

      {selectedJobId && <JobDetailDrawer />}
    </div>
  );
}
