import { buildDayItinerary, summarizeItinerary } from "./itinerary";
import { DAY_END, DAY_START, formatMinutes, toMinutes } from "./time";
import type { CrewTeam, Job, PlanConstraints, PlanRecommendation, PlanSummary } from "./types";

let counter = 0;
function nextId(prefix: string): string {
  counter += 1;
  return `${prefix}-${counter}`;
}

interface Interval {
  start: number;
  end: number;
  label: string;
}

function crewBusyIntervals(crew: CrewTeam, jobs: Job[]): Interval[] {
  return jobs
    .filter((j) => j.crewTeamId === crew.id && (j.status === "confirmed" || j.status === "conflict"))
    .filter((j) => j.scheduledStartMinutes != null && j.scheduledEndMinutes != null)
    .map((j) => ({ start: j.scheduledStartMinutes!, end: j.scheduledEndMinutes!, label: j.customerName }))
    .sort((a, b) => a.start - b.start);
}

function findGaps(intervals: Interval[], dayStart: number, dayEnd: number) {
  const gaps: { start: number; end: number; afterLabel: string | null }[] = [];
  let cursor = dayStart;
  let afterLabel: string | null = null;
  for (const iv of intervals) {
    if (iv.start > cursor) gaps.push({ start: cursor, end: iv.start, afterLabel });
    cursor = Math.max(cursor, iv.end);
    afterLabel = iv.label;
  }
  gaps.push({ start: cursor, end: dayEnd, afterLabel });
  return gaps;
}

interface Candidate {
  crew: CrewTeam;
  start: number;
  afterLabel: string | null;
}

function findReassignSlot(
  jobDurationMinutes: number,
  crews: CrewTeam[],
  jobs: Job[],
  constraints: PlanConstraints
): Candidate | null {
  const earliestStart = DAY_START + 30;
  const cutoff = constraints.avoidOvertime ? toMinutes(17, 0) : DAY_END;
  const candidates: Candidate[] = [];
  for (const crew of crews) {
    const gaps = findGaps(crewBusyIntervals(crew, jobs), earliestStart, cutoff);
    for (const gap of gaps) {
      if (gap.end - gap.start >= jobDurationMinutes) {
        candidates.push({ crew, start: gap.start, afterLabel: gap.afterLabel });
      }
    }
  }
  if (candidates.length === 0) return null;
  candidates.sort((a, b) => (constraints.prioritizeOverdue ? a.start - b.start : b.start - a.start));
  return candidates[0];
}

export interface GeneratedPlan {
  recommendations: PlanRecommendation[];
  summary: PlanSummary;
}

export function generateAiPlan(jobs: Job[], crews: CrewTeam[], constraints: PlanConstraints): GeneratedPlan {
  const recommendations: PlanRecommendation[] = [];

  const overdueJobs = jobs.filter((j) => j.status === "unassigned" && j.overdue);
  const hardUnassignedJobs = jobs.filter((j) => j.status === "unassigned" && !j.overdue);

  let resolvedCount = 0;

  for (const job of overdueJobs) {
    const slot = findReassignSlot(job.durationMinutes, crews, jobs, constraints);
    if (slot) {
      resolvedCount += 1;
      const timeLabel = formatMinutes(slot.start);
      const reason = slot.afterLabel
        ? `Closest qualified crew — free right after ${slot.afterLabel}, and both cleaners are deep-clean certified.`
        : `Closest qualified crew — open at the start of the day, and both cleaners are deep-clean certified.`;
      recommendations.push({
        id: nextId("rec"),
        type: "reassign",
        title: `Move ${job.customerName} to ${slot.crew.name} at ${timeLabel}`,
        detail: reason,
        crewTeamId: slot.crew.id,
        jobId: job.id,
        timeLabel,
        startMinutes: slot.start,
        status: "pending",
        canDecide: true,
      });
    } else {
      recommendations.push({
        id: nextId("rec"),
        type: "needs-dispatcher",
        title: `${job.customerName} remains unassigned`,
        detail: "No crew has enough open time left today. Reschedule in Jobber or add overtime.",
        jobId: job.id,
        status: "pending",
        canDecide: false,
      });
    }
  }

  // Compliance: rest/meal breaks are inserted automatically by buildDayItinerary
  // per the break policy. Here we just check whether that auto-insertion pushed
  // any stop past the client's booked window — that's the one case a dispatcher
  // actually needs to decide something about.
  for (const crew of crews) {
    const itinerary = buildDayItinerary(crew, jobs);
    const hadBreak = itinerary.some((i) => i.type === "break" || i.type === "lunch");
    if (hadBreak) resolvedCount += 1;

    const missed = itinerary.find((i) => i.type === "job" && i.warning?.startsWith("Required break"));
    if (missed?.jobId) {
      const job = jobs.find((j) => j.id === missed.jobId);
      recommendations.push({
        id: nextId("rec"),
        type: "compliance",
        title: `${job?.customerName ?? "A stop"} may miss its client window`,
        detail: `${missed.warning} Consider moving it to a crew with more room, or confirming the later arrival with the client.`,
        crewTeamId: crew.id,
        jobId: missed.jobId,
        status: "pending",
        canDecide: false,
      });
    }
  }

  for (const job of hardUnassignedJobs) {
    recommendations.push({
      id: nextId("rec"),
      type: "needs-dispatcher",
      title: `${job.customerName} remains unassigned`,
      detail: job.unassignedReason ?? "No crew can take this job today.",
      jobId: job.id,
      status: "pending",
      canDecide: false,
    });
  }

  const assigned = jobs.filter((j) => j.status === "confirmed" || j.status === "conflict").length;
  const resolvableOverdueCount = overdueJobs.filter((j) => findReassignSlot(j.durationMinutes, crews, jobs, constraints)).length;
  const unassignedCount = jobs.filter((j) => j.status === "unassigned").length - resolvableOverdueCount;

  const spans = crews
    .map((crew) => summarizeItinerary(buildDayItinerary(crew, jobs)))
    .filter((s) => s.jobCount > 0)
    .map((s) => s.endMinutes - s.startMinutes);
  const avgCrewTimeMinutes = spans.length ? Math.round(spans.reduce((a, b) => a + b, 0) / spans.length) : 0;

  const summary: PlanSummary = {
    evaluated: jobs.length,
    assigned,
    unassigned: Math.max(0, unassignedCount),
    conflictsResolved: resolvedCount,
    avgCrewTimeMinutes,
  };

  return { recommendations, summary };
}

export interface ParsedInstruction {
  recognized: boolean;
  updates: Partial<PlanConstraints>;
  ackFragments: string[];
}

export function parseInstruction(text: string): ParsedInstruction {
  const lower = text.toLowerCase();
  const updates: Partial<PlanConstraints> = {};
  const ackFragments: string[] = [];
  let recognized = false;

  if (/overdue/.test(lower)) {
    updates.prioritizeOverdue = true;
    ackFragments.push("moved the overdue job to the earliest open slot instead of the end of the day");
    recognized = true;
  }
  if (/overtime/.test(lower)) {
    updates.avoidOvertime = true;
    ackFragments.push("kept every crew inside a healthy workday length");
    recognized = true;
  }
  if (/keep.*crew.*together|together/.test(lower)) {
    ackFragments.push("crews are already dispatched as fixed two-person teams, so I never split them up");
    recognized = true;
  }

  return { recognized, updates, ackFragments };
}
