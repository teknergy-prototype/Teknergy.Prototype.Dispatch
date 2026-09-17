import type { ISODate, Project, ProposedChange } from "./types";

/** Only non-rejected changes are "active" — i.e. still shown as proposed on the calendar. */
export function activeChangeMap(changes: ProposedChange[] | undefined): Map<string, ProposedChange> {
  const map = new Map<string, ProposedChange>();
  if (!changes) return map;
  for (const c of changes) {
    if (c.status !== "rejected") map.set(c.projectId, c);
  }
  return map;
}

/** The project's work days as they'd appear with the proposal preview applied. */
export function effectiveWorkDays(project: Project, change?: ProposedChange): ISODate[] {
  if (!change || change.proposedDay == null) return project.workDays;
  if (change.previousDay === change.proposedDay) return project.workDays;
  const set = new Set(project.workDays);
  if (change.previousDay) set.delete(change.previousDay);
  set.add(change.proposedDay);
  return Array.from(set);
}

export function isProposedCell(change: ProposedChange | undefined, day: ISODate): boolean {
  return Boolean(change && change.proposedDay === day);
}
