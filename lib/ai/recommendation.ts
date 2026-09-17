import { isEmployeeOffOn } from "../availability";
import { hasDate, isOverdue } from "../queue";
import type {
  AIConstraints,
  AvailabilityEntry,
  CrewAssignment,
  Employee,
  ISODate,
  Project,
  ProposalSummary,
  ProposedChange,
} from "../types";

let counter = 0;
function nextChangeId(): string {
  counter += 1;
  return `change-${Date.now()}-${counter}`;
}

function priorityRank(p: Project): number {
  if (isOverdue(p)) return 0;
  if (!hasDate(p)) return 1;
  const priority = p.priority ?? "Medium";
  if (priority === "High") return 2;
  if (priority === "Medium") return 3;
  return 4;
}

function groupKeyFor(p: Project, pinnedGroups: string[]): string {
  const lowerName = p.name.toLowerCase();
  const pin = pinnedGroups.find((k) => lowerName.includes(k));
  if (pin) return `pin:${pin}`;
  return p.parentProjectId ?? p.id;
}

export interface GenerateProposalParams {
  days: ISODate[];
  projects: Project[];
  employees: Employee[];
  crewAssignments: CrewAssignment[];
  availabilityEntries: AvailabilityEntry[];
  constraints: AIConstraints;
}

export interface GenerateProposalResult {
  changes: ProposedChange[];
  summary: ProposalSummary;
}

export function generateProposal(params: GenerateProposalParams): GenerateProposalResult {
  const { days, projects, employees, crewAssignments, availabilityEntries, constraints } = params;
  const projectsById = new Map(projects.map((p) => [p.id, p]));
  const employeesById = new Map(employees.map((e) => [e.id, e]));

  // Candidates: unscheduled + overdue (need placement within scope) + already-dated
  // projects that already fall inside the scope (may get a crew fix, never moved).
  const candidates = projects.filter((p) => {
    if (!p.hasSignedEstimate) return false;
    if (p.parentProjectId) {
      const parent = projectsById.get(p.parentProjectId);
      if (parent && !parent.hasSignedEstimate) return false;
    }
    if (!hasDate(p)) return true;
    if (isOverdue(p)) return true;
    return p.workDays.some((d) => days.includes(d));
  });

  candidates.sort((a, b) => priorityRank(a) - priorityRank(b));

  // Track load across the whole scope so we can reason about overtime + balance.
  const dayAssignmentCount = new Map<string, number>();
  for (const a of crewAssignments) {
    if (days.includes(a.day)) {
      dayAssignmentCount.set(a.employeeId, (dayAssignmentCount.get(a.employeeId) ?? 0) + 1);
    }
  }
  // Every real booking (in or out of scope) blocks double-booking that same day.
  const busyByEmployeeDay = new Set<string>();
  for (const a of crewAssignments) busyByEmployeeDay.add(`${a.employeeId}|${a.day}`);

  const groupCrew = new Map<string, string>();
  const changes: ProposedChange[] = [];
  let conflictsResolved = 0;
  let overdueCursor = constraints.prioritizeOverdue ? 0 : 1;
  let unscheduledCursor = constraints.prioritizeOverdue ? 2 : 0;

  function pickDay(kind: "overdue" | "unscheduled"): ISODate {
    if (kind === "overdue") {
      const idx = Math.min(days.length - 1, overdueCursor);
      overdueCursor += 1;
      return days[idx];
    }
    const idx = Math.min(days.length - 1, unscheduledCursor);
    unscheduledCursor += 1;
    return days[idx];
  }

  function pickCrew(
    p: Project,
    targetDay: ISODate,
    originalCrewIds: string[],
    groupKey: string
  ): string | null {
    const requiredSkills = p.requiredSkills ?? [];
    const pool: string[] = [];
    const pinned = groupCrew.get(groupKey);
    if (pinned) pool.push(pinned);
    for (const id of originalCrewIds) if (!pool.includes(id)) pool.push(id);
    const rest = employees
      .filter((e) => !pool.includes(e.id))
      .sort((a, b) => (dayAssignmentCount.get(a.id) ?? 0) - (dayAssignmentCount.get(b.id) ?? 0));
    for (const e of rest) pool.push(e.id);

    for (const candidateId of pool) {
      const emp = employeesById.get(candidateId);
      if (!emp) continue;
      if (requiredSkills.length && !requiredSkills.every((sk) => (emp.skills ?? []).includes(sk))) continue;
      if (isEmployeeOffOn(availabilityEntries, candidateId, targetDay)) continue;
      const alreadyBusy = busyByEmployeeDay.has(`${candidateId}|${targetDay}`);
      const isKeepingOwnSlot = originalCrewIds.includes(candidateId);
      if (alreadyBusy && !isKeepingOwnSlot) continue;
      if (constraints.avoidOvertime && (dayAssignmentCount.get(candidateId) ?? 0) >= 5) continue;
      if (constraints.excludedCrewDay.some((x) => x.employeeId === candidateId && x.day === targetDay)) continue;
      return candidateId;
    }
    return null;
  }

  for (const p of candidates) {
    const groupKey = groupKeyFor(p, constraints.pinnedGroups);
    const dated = hasDate(p);
    const overdue = isOverdue(p);
    const originalDay = dated ? p.workDays.find((d) => days.includes(d)) ?? p.workDays[0] : null;
    const originalCrewIds = originalDay
      ? crewAssignments.filter((a) => a.projectId === p.id && a.day === originalDay).map((a) => a.employeeId)
      : [];

    if (!dated) {
      const targetDay = pickDay("unscheduled");
      const chosen = pickCrew(p, targetDay, [], groupKey);
      if (chosen) {
        groupCrew.set(groupKey, chosen);
        busyByEmployeeDay.add(`${chosen}|${targetDay}`);
        dayAssignmentCount.set(chosen, (dayAssignmentCount.get(chosen) ?? 0) + 1);
        changes.push({
          id: nextChangeId(),
          projectId: p.id,
          type: "new-assignment",
          previousDay: null,
          previousCrewIds: [],
          proposedDay: targetDay,
          proposedCrewIds: [chosen],
          reason: "Best available crew with required skills",
          status: "pending",
        });
      } else {
        changes.push({
          id: nextChangeId(),
          projectId: p.id,
          type: "unassigned",
          previousDay: null,
          previousCrewIds: [],
          proposedDay: null,
          proposedCrewIds: [],
          reason: "No qualified crew available in the selected date range",
          status: "pending",
        });
      }
      continue;
    }

    if (overdue) {
      const targetDay = pickDay("overdue");
      const chosen = pickCrew(p, targetDay, originalCrewIds, groupKey);
      if (chosen) {
        groupCrew.set(groupKey, chosen);
        busyByEmployeeDay.add(`${chosen}|${targetDay}`);
        dayAssignmentCount.set(chosen, (dayAssignmentCount.get(chosen) ?? 0) + 1);
        changes.push({
          id: nextChangeId(),
          projectId: p.id,
          type: "reschedule",
          previousDay: originalDay ?? null,
          previousCrewIds: originalCrewIds,
          proposedDay: targetDay,
          proposedCrewIds: [chosen],
          reason: "Prioritized because the Project is overdue",
          status: "pending",
        });
      } else {
        changes.push({
          id: nextChangeId(),
          projectId: p.id,
          type: "unassigned",
          previousDay: originalDay ?? null,
          previousCrewIds: originalCrewIds,
          proposedDay: null,
          proposedCrewIds: [],
          reason: "No qualified crew available in the selected date range",
          status: "pending",
        });
      }
      continue;
    }

    // Dated, not overdue, already inside scope: only touched to fix a conflict.
    const hasConflict = originalDay != null && originalCrewIds.some((id) => isEmployeeOffOn(availabilityEntries, id, originalDay!));
    if (hasConflict && originalDay) {
      const chosen = pickCrew(p, originalDay, [], groupKey);
      if (chosen) {
        conflictsResolved += 1;
        groupCrew.set(groupKey, chosen);
        busyByEmployeeDay.add(`${chosen}|${originalDay}`);
        dayAssignmentCount.set(chosen, (dayAssignmentCount.get(chosen) ?? 0) + 1);
        changes.push({
          id: nextChangeId(),
          projectId: p.id,
          type: "reassign-crew",
          previousDay: originalDay,
          previousCrewIds: originalCrewIds,
          proposedDay: originalDay,
          proposedCrewIds: [chosen],
          reason: "Original crew unavailable that day (day off) — reassigned to resolve the conflict",
          status: "pending",
        });
      } else {
        changes.push({
          id: nextChangeId(),
          projectId: p.id,
          type: "unassigned",
          previousDay: originalDay,
          previousCrewIds: originalCrewIds,
          proposedDay: originalDay,
          proposedCrewIds: originalCrewIds,
          reason: "Conflict detected but no replacement crew is available",
          status: "pending",
        });
      }
    }
    // else: no conflict, nothing to propose for this project.
  }

  const changesByProject = new Map(changes.map((c) => [c.projectId, c]));
  const assigned = candidates.filter((p) => {
    const change = changesByProject.get(p.id);
    if (change) return change.type !== "unassigned";
    return hasDate(p);
  }).length;

  const estimatedOvertimeHours = Array.from(dayAssignmentCount.values()).reduce(
    (sum, count) => sum + Math.max(0, count - 5) * 4,
    0
  );

  const summary: ProposalSummary = {
    evaluated: candidates.length,
    assigned,
    unassigned: candidates.length - assigned,
    conflictsResolved,
    estimatedOvertimeHours,
  };

  return { changes, summary };
}

const WEEKDAYS: Record<string, number> = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};

function fromISOLocal(day: ISODate): Date {
  const [y, m, d] = day.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export interface ParsedInstruction {
  recognized: boolean;
  updates: Partial<AIConstraints>;
  ackFragments: string[];
}

/** A tiny deterministic rule-based "NLU" — no real AI/LLM involved. */
export function parseInstruction(
  text: string,
  employees: Employee[],
  days: ISODate[],
  projects: Project[]
): ParsedInstruction {
  const lower = text.toLowerCase();
  const updates: Partial<AIConstraints> = {};
  const ackFragments: string[] = [];
  let recognized = false;

  if (/overdue/.test(lower)) {
    updates.prioritizeOverdue = true;
    ackFragments.push("moved overdue Projects earlier in the week");
    recognized = true;
  }

  if (/overtime/.test(lower)) {
    updates.avoidOvertime = true;
    ackFragments.push("rebalanced crew workload to avoid overtime");
    recognized = true;
  }

  const foundWeekday = Object.keys(WEEKDAYS).find((w) => lower.includes(w));
  const isNegative = /\b(not|don't|do not|avoid|no)\b/.test(lower);
  if (foundWeekday && isNegative) {
    const matchedEmployee = employees.find((e) =>
      lower.includes(e.name.toLowerCase().split(" ")[0])
    );
    if (matchedEmployee) {
      const targetDow = WEEKDAYS[foundWeekday];
      const matchingDays = days.filter((d) => fromISOLocal(d).getDay() === targetDow);
      updates.excludedCrewDay = matchingDays.map((d) => ({ employeeId: matchedEmployee.id, day: d }));
      const label = foundWeekday[0].toUpperCase() + foundWeekday.slice(1);
      ackFragments.push(`avoided assigning ${matchedEmployee.name.split(" ")[0]} on ${label}`);
      recognized = true;
    }
  }

  if (/same crew|keep.*crew/.test(lower)) {
    const stopwords = new Set([
      "same",
      "crew",
      "keep",
      "the",
      "on",
      "jobs",
      "job",
      "projects",
      "project",
      "and",
      "with",
    ]);
    const words = lower.split(/[^a-z]+/).filter((w) => w.length > 3 && !stopwords.has(w));
    const keyword = words.find((w) => projects.some((p) => p.name.toLowerCase().includes(w)));
    if (keyword) {
      updates.pinnedGroups = [keyword];
      ackFragments.push(`kept the same crew across the ${keyword[0].toUpperCase() + keyword.slice(1)} Projects`);
      recognized = true;
    }
  }

  return { recognized, updates, ackFragments };
}
