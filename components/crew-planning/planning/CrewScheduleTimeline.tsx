"use client";

import { buildDayItinerary, summarizeItinerary } from "@/lib/crew-planning/itinerary";
import { BREAK_POLICY_LABEL } from "@/lib/crew-planning/breakPolicy";
import { JOB_STATUS_STYLES } from "@/lib/crew-planning/colors";
import { useCrewPlanningStore } from "@/lib/crew-planning/store";
import { DAY_END, DAY_START, formatDuration, formatMinutes, pctOfDay } from "@/lib/crew-planning/time";
import type { CrewTeam, ItineraryItem, Job } from "@/lib/crew-planning/types";
import { cn } from "@/lib/cn";
import { BoxIcon, ClipboardIcon, CoffeeIcon, HomeIcon, InfoIcon } from "../../ui/Icons";

const OP_ICONS: Partial<Record<ItineraryItem["type"], typeof HomeIcon>> = {
  checkin: ClipboardIcon,
  "load-equipment": BoxIcon,
  break: CoffeeIcon,
  lunch: CoffeeIcon,
  "return-office": HomeIcon,
  "end-day": HomeIcon,
};

const HOURS = Array.from({ length: (DAY_END - DAY_START) / 60 + 1 }, (_, i) => DAY_START + i * 60);

function hourLabel(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const period = h >= 12 ? "p" : "a";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}${period}`;
}

const LEGEND: { key: string; label: string; color: string; dashed?: boolean }[] = [
  { key: "confirmed", label: "Confirmed", color: JOB_STATUS_STYLES.confirmed.border },
  { key: "proposed", label: "Proposed", color: JOB_STATUS_STYLES.proposed.border, dashed: true },
  { key: "conflict", label: "Conflict", color: JOB_STATUS_STYLES.conflict.border },
  { key: "unassigned", label: "Unassigned", color: JOB_STATUS_STYLES.unassigned.border, dashed: true },
];

export function CrewScheduleTimeline() {
  const crews = useCrewPlanningStore((s) => s.crews);
  const teamMembers = useCrewPlanningStore((s) => s.teamMembers);
  const jobs = useCrewPlanningStore((s) => s.jobs);
  const setSelectedJobId = useCrewPlanningStore((s) => s.setSelectedJobId);

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-auto">
      <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-4 py-2.5">
        <div>
          <h2 className="text-xs font-semibold text-[var(--foreground)]">Crew Schedule</h2>
          <p className="flex items-center gap-1 text-[10px] text-[var(--muted)]">
            Operational day · travel, load-out and breaks included · simulated policy
            <span title={BREAK_POLICY_LABEL} className="cursor-help text-[var(--muted-2)]">
              <InfoIcon size={11} />
            </span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          {LEGEND.map((l) => (
            <span key={l.key} className="flex items-center gap-1 text-[10px] text-[var(--muted)]">
              <span
                className="h-2 w-2 rounded-full"
                style={{
                  border: `1.5px ${l.dashed ? "dashed" : "solid"} ${l.color}`,
                  backgroundColor: l.dashed ? "transparent" : l.color,
                }}
              />
              {l.label}
            </span>
          ))}
        </div>
      </div>

      <div className="min-w-[720px] flex-1 p-4">
        <div className="relative mb-1 h-5">
          {HOURS.map((h) => (
            <span
              key={h}
              className="absolute -translate-x-1/2 text-[10px] font-medium text-[var(--muted-2)]"
              style={{ left: `${pctOfDay(h)}%` }}
            >
              {hourLabel(h)}
            </span>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          {crews.map((crew) => (
            <CrewRow key={crew.id} crew={crew} jobs={jobs} teamMemberNames={teamMembers} onSelectJob={setSelectedJobId} />
          ))}
        </div>
      </div>

    </div>
  );
}

function CrewRow({
  crew,
  jobs,
  teamMemberNames,
  onSelectJob,
}: {
  crew: CrewTeam;
  jobs: Job[];
  teamMemberNames: { id: string; name: string }[];
  onSelectJob: (id: string) => void;
}) {
  const aiPlan = useCrewPlanningStore((s) => s.aiPlan);
  const crewJobs = jobs.filter((j) => j.crewTeamId === crew.id && (j.status === "confirmed" || j.status === "conflict"));
  const itinerary = buildDayItinerary(crew, jobs);
  const summary = summarizeItinerary(itinerary);
  const members = crew.memberIds.map((id) => teamMemberNames.find((m) => m.id === id)?.name).filter(Boolean);
  const conflictCount = crewJobs.filter((j) => j.status === "conflict").length;

  const proposedForCrew =
    aiPlan?.status === "draft"
      ? aiPlan.recommendations.filter(
          (r) => r.type === "reassign" && r.crewTeamId === crew.id && r.status !== "skipped" && r.startMinutes != null
        )
      : [];

  return (
    <div className="flex items-stretch gap-3 rounded-md border border-[var(--border-subtle)] bg-[var(--surface)] p-2.5">
      <div className="w-36 shrink-0">
        <div className="text-xs font-semibold text-[var(--foreground)]">{crew.name}</div>
        <div className="truncate text-[10px] text-[var(--muted)]">{members.join(" + ")}</div>
        <div className="mt-2 text-[10px] font-medium text-[var(--muted-2)]">
          {formatDuration(summary.endMinutes - summary.startMinutes)} · {crewJobs.length} Job{crewJobs.length === 1 ? "" : "s"}
        </div>
        {conflictCount > 0 && <div className="mt-0.5 text-[10px] font-medium text-red-600">{conflictCount} conflict</div>}
      </div>

      <div className="relative min-h-[64px] flex-1 rounded-md bg-black/[0.015] dark:bg-white/[0.03]">
        {groupOpSegments(itinerary).map((segment) => (
          <OpSegmentMarker key={segment[0].id} items={segment} />
        ))}

        {crewJobs.map((job) => {
          const style = JOB_STATUS_STYLES[job.status];
          const left = pctOfDay(job.scheduledStartMinutes!);
          const width = pctOfDay(job.scheduledEndMinutes!) - left;
          return (
            <button
              key={job.id}
              onClick={() => onSelectJob(job.id)}
              className="absolute top-1 bottom-1 flex flex-col justify-center overflow-hidden rounded-md border px-2 text-left shadow-sm"
              style={{
                left: `${left}%`,
                width: `${Math.max(width, 6)}%`,
                backgroundColor: style.bg,
                borderColor: style.border,
              }}
            >
              <span className="truncate text-[10px] font-semibold" style={{ color: style.text }}>
                {job.customerName}
              </span>
              <span className="truncate text-[9px]" style={{ color: style.text }}>
                {formatMinutes(job.scheduledStartMinutes!)}–{formatMinutes(job.scheduledEndMinutes!)}
              </span>
              {job.status === "conflict" && (
                <span className="truncate text-[9px] font-semibold" style={{ color: style.text }}>
                  CONFLICT · {job.conflictNote}
                </span>
              )}
            </button>
          );
        })}

        {proposedForCrew.map((rec) => {
          const job = jobs.find((j) => j.id === rec.jobId);
          if (!job) return null;
          const style = JOB_STATUS_STYLES.proposed;
          const left = pctOfDay(rec.startMinutes!);
          const width = pctOfDay(rec.startMinutes! + job.durationMinutes) - left;
          return (
            <button
              key={rec.id}
              onClick={() => onSelectJob(job.id)}
              className="absolute top-1 bottom-1 flex flex-col justify-center overflow-hidden rounded-md border border-dashed px-2 text-left"
              style={{ left: `${left}%`, width: `${Math.max(width, 6)}%`, backgroundColor: style.bg, borderColor: style.border }}
            >
              <span className="truncate text-[9px] font-semibold uppercase tracking-wide" style={{ color: style.text }}>
                Proposed
              </span>
              <span className="truncate text-[10px] font-semibold" style={{ color: style.text }}>
                {job.customerName}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Consecutive non-job events (checkin, load-out, travel, break, lunch) often
 * span only a few minutes each, which collapses to the same pixel position on
 * an 11-hour axis. Rendering one marker per event caused icons to stack on
 * top of each other; grouping every run of non-job events between two jobs
 * into a single combined pill keeps the timeline legible.
 */
function groupOpSegments(itinerary: ItineraryItem[]): ItineraryItem[][] {
  const segments: ItineraryItem[][] = [];
  let current: ItineraryItem[] = [];
  for (const item of itinerary) {
    if (item.type === "job") {
      if (current.length) segments.push(current);
      current = [];
    } else {
      current.push(item);
    }
  }
  if (current.length) segments.push(current);
  return segments;
}

function OpSegmentMarker({ items }: { items: ItineraryItem[] }) {
  const start = items[0].startMinutes;
  const end = items[items.length - 1].endMinutes;
  const left = pctOfDay((start + end) / 2);
  const totalDuration = end - start;
  const hasWarning = items.some((item) => Boolean(item.warning));
  const title = items
    .map((item) => `${item.label}${item.detail ? ` · ${item.detail}` : ""} (${formatDuration(item.endMinutes - item.startMinutes)})${item.warning ? ` — ${item.warning}` : ""}`)
    .join("\n");

  return (
    <div
      title={title}
      className={cn(
        "absolute top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-1 rounded-full border px-1.5 py-0.5 text-[9px] font-semibold whitespace-nowrap",
        hasWarning
          ? "border-red-300 bg-red-50 text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400"
          : "border-[var(--border)] bg-[var(--surface)] text-[var(--muted)]"
      )}
      style={{ left: `${left}%` }}
    >
      {items.map((item) => {
        if (item.type === "travel") return <span key={item.id}>→</span>;
        const Icon = OP_ICONS[item.type] ?? ClipboardIcon;
        return <Icon key={item.id} size={11} />;
      })}
      {totalDuration >= 20 && <span>{formatDuration(totalDuration)}</span>}
    </div>
  );
}
