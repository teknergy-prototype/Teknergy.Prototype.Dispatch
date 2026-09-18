import { DEFAULT_BREAK_POLICY, type BreakPolicy } from "./breakPolicy";
import { toMinutes } from "./time";
import type { CrewTeam, ItineraryItem, Job } from "./types";

/** Crews start their real day at 7:45 AM (office check-in) — distinct from the
 * Gantt chart's 7:00 AM–6:00 PM display window in time.ts. */
const CREW_DAY_START = toMinutes(7, 45);
const CHECKIN_MIN = 5;
const LOAD_MIN = 5;
const WRAP_UP_MIN = 17;
const OFFICE_LABEL = "Office";

/** Exact travel legs called out in the source mockups — everything else falls back to a deterministic estimate. */
const KNOWN_LEGS: Record<string, { minutes: number; miles: number }> = {
  "Office→Greenwood Residence": { minutes: 20, miles: 4.2 },
  "Greenwood Residence→Oakwood Dental": { minutes: 15, miles: 2.8 },
  "Oakwood Dental→Riverside Apartment": { minutes: 18, miles: 3.6 },
  "Riverside Apartment→Office": { minutes: 20, miles: 4.9 },
  "Lakeside Retail→Northgate Fitness Club": { minutes: 60, miles: 14.1 },
};

function hash(text: string): number {
  let h = 0;
  for (let i = 0; i < text.length; i++) {
    h = (h << 5) - h + text.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function travelLeg(fromLabel: string, toLabel: string): { minutes: number; miles: number } {
  const key = `${fromLabel}→${toLabel}`;
  if (KNOWN_LEGS[key]) return KNOWN_LEGS[key];
  const h = hash(key);
  return {
    minutes: 12 + (h % 14), // 12–25 min
    miles: Math.round((2.5 + (h % 40) / 10) * 10) / 10, // 2.5–6.5 mi
  };
}

let counter = 0;
function nextId(prefix: string): string {
  counter += 1;
  return `${prefix}-${counter}`;
}

/**
 * Builds a crew's chronological day itinerary from their confirmed jobs:
 * office check-in/load-out, travel between stops, and paid rest breaks /
 * unpaid meal periods inserted whenever accumulated on-duty time crosses the
 * break policy's thresholds (not a fixed "after job 1" guess). Re-deriving
 * this from live job data means an accepted AI reassignment — or a break the
 * policy requires — shows up on the crew's day sheet automatically.
 */
export function buildDayItinerary(
  crew: CrewTeam,
  allJobs: Job[],
  policy: BreakPolicy = DEFAULT_BREAK_POLICY
): ItineraryItem[] {
  const jobs = allJobs
    .filter((j) => j.crewTeamId === crew.id && (j.status === "confirmed" || j.status === "conflict"))
    .filter((j) => j.scheduledStartMinutes != null)
    .sort((a, b) => a.scheduledStartMinutes! - b.scheduledStartMinutes!);

  const items: ItineraryItem[] = [];
  if (jobs.length === 0) return items;

  let cursor = CREW_DAY_START;
  let sinceRest = 0;
  let sinceMeal = 0;
  let mealsTaken = 0;

  function pushOp(duration: number, fields: Omit<ItineraryItem, "id" | "startMinutes" | "endMinutes">) {
    items.push({ id: nextId("it"), startMinutes: cursor, endMinutes: cursor + duration, ...fields });
    cursor += duration;
    sinceRest += duration;
    sinceMeal += duration;
  }

  pushOp(CHECKIN_MIN, {
    type: "checkin",
    label: "Office check-in",
    detail: "Review day instructions and collect supplies",
  });
  pushOp(LOAD_MIN, { type: "load-equipment", label: "Load equipment", detail: "Vacuum, mop kit, cleaning supplies" });

  let previousLabel = OFFICE_LABEL;

  jobs.forEach((job, index) => {
    const leg = travelLeg(previousLabel, job.customerName);
    const travelStart = cursor;
    const travelEnd = job.scheduledStartMinutes! > cursor + leg.minutes ? job.scheduledStartMinutes! : cursor + leg.minutes;
    const travelDuration = travelEnd - travelStart;
    const isLateArrival = job.status === "conflict";
    items.push({
      id: nextId("it"),
      type: "travel",
      startMinutes: travelStart,
      endMinutes: travelEnd,
      label: "Travel",
      detail: `${previousLabel} → ${job.customerName}`,
      miles: leg.miles,
      warning:
        job.id === "1055"
          ? "Traffic buffer reduced to 5 min before Job #1055"
          : isLateArrival
            ? `Arriving ${job.conflictNote ?? "late"} — heavier traffic than planned`
            : undefined,
    });
    cursor = travelEnd;
    sinceRest += travelDuration;
    sinceMeal += travelDuration;

    const jobStart = Math.max(cursor, job.scheduledStartMinutes!);
    const jobDuration = job.durationMinutes;
    const jobEnd = jobStart + jobDuration;
    const missedWindow = job.scheduledEndMinutes != null && jobStart > job.scheduledEndMinutes;
    items.push({
      id: nextId("it"),
      type: "job",
      startMinutes: jobStart,
      endMinutes: jobEnd,
      label: `Job #${job.id}`,
      detail: job.serviceType,
      jobId: job.id,
      warning: missedWindow
        ? `Required break pushed this stop past its ${job.jobberAppointmentId ? "Jobber " : ""}client window`
        : undefined,
    });
    cursor = jobEnd;
    sinceRest += jobDuration;
    sinceMeal += jobDuration;
    previousLabel = job.customerName;

    const isLastJob = index === jobs.length - 1;
    if (!isLastJob) {
      const elapsedSinceStart = cursor - CREW_DAY_START;
      const dueSecondMeal = mealsTaken === 1 && elapsedSinceStart >= policy.secondMealAfterMinutes;
      const dueFirstMeal = mealsTaken === 0 && sinceMeal >= policy.mealBreakAfterMinutes;
      if (mealsTaken < 2 && (dueFirstMeal || dueSecondMeal)) {
        pushOp(policy.mealBreakDurationMinutes, {
          type: "lunch",
          label: "Lunch",
          detail: `Unpaid · ${policy.mealBreakDurationMinutes} min`,
        });
        sinceMeal = 0;
        sinceRest = 0;
        mealsTaken += 1;
      } else if (sinceRest >= policy.restBreakEveryMinutes) {
        pushOp(policy.restBreakDurationMinutes, { type: "break", label: "Break", detail: "Paid rest break" });
        sinceRest = 0;
      }
    }
  });

  const legBack = travelLeg(previousLabel, OFFICE_LABEL);
  pushOp(legBack.minutes, { type: "travel", label: "Travel to office", detail: `${previousLabel} → Office`, miles: legBack.miles });
  pushOp(WRAP_UP_MIN, { type: "end-day", label: "Return supplies and end day" });

  return items;
}

export interface DaySummary {
  startMinutes: number;
  endMinutes: number;
  jobCount: number;
  serviceMinutes: number;
  travelMinutes: number;
  breakMinutes: number;
  miles: number;
}

export function summarizeItinerary(items: ItineraryItem[]): DaySummary {
  if (items.length === 0) {
    return {
      startMinutes: CREW_DAY_START,
      endMinutes: CREW_DAY_START,
      jobCount: 0,
      serviceMinutes: 0,
      travelMinutes: 0,
      breakMinutes: 0,
      miles: 0,
    };
  }
  const jobItems = items.filter((i) => i.type === "job");
  const travelItems = items.filter((i) => i.type === "travel");
  const breakItems = items.filter((i) => i.type === "break" || i.type === "lunch");
  return {
    startMinutes: items[0].startMinutes,
    endMinutes: items[items.length - 1].endMinutes,
    jobCount: jobItems.length,
    serviceMinutes: jobItems.reduce((sum, i) => sum + (i.endMinutes - i.startMinutes), 0),
    travelMinutes: travelItems.reduce((sum, i) => sum + (i.endMinutes - i.startMinutes), 0),
    breakMinutes: breakItems.reduce((sum, i) => sum + (i.endMinutes - i.startMinutes), 0),
    miles: Math.round(travelItems.reduce((sum, i) => sum + (i.miles ?? 0), 0) * 10) / 10,
  };
}
