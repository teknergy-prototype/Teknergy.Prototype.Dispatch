import { isBeforeToday } from "./dates";
import type { ISODate, Project } from "./types";

export function lastCoverageDate(project: Project): ISODate | null {
  const dates: ISODate[] = [...project.workDays];
  if (project.endDate) dates.push(project.endDate);
  if (project.beginDate) dates.push(project.beginDate);
  if (dates.length === 0) return null;
  return dates.reduce((max, d) => (d > max ? d : max));
}

export function hasDate(project: Project): boolean {
  return Boolean(project.beginDate || project.endDate || project.workDays.length > 0);
}

export function isOverdue(project: Project): boolean {
  const last = lastCoverageDate(project);
  return Boolean(last && isBeforeToday(last));
}

export function isProjectLocked(project: Project, projectsById: Map<string, Project>): boolean {
  if (!project.hasSignedEstimate) return true;
  if (project.parentProjectId) {
    const parent = projectsById.get(project.parentProjectId);
    if (parent && !parent.hasSignedEstimate) return true;
  }
  return false;
}

export interface QueueGroup {
  project: Project;
  children: Project[];
}

/** Nests a subproject under its parent only when both fall in the same section. */
export function buildQueueTree(sectionProjects: Project[]): QueueGroup[] {
  const idsInSection = new Set(sectionProjects.map((p) => p.id));
  const roots = sectionProjects.filter(
    (p) => !p.parentProjectId || !idsInSection.has(p.parentProjectId)
  );
  return roots.map((root) => ({
    project: root,
    children: sectionProjects.filter((p) => p.parentProjectId === root.id),
  }));
}

export interface StatusBucket {
  status: string;
  groups: QueueGroup[];
}

export function groupByStatus(groups: QueueGroup[]): StatusBucket[] {
  const order: string[] = [];
  const map = new Map<string, QueueGroup[]>();
  for (const g of groups) {
    if (!map.has(g.project.status)) {
      order.push(g.project.status);
      map.set(g.project.status, []);
    }
    map.get(g.project.status)!.push(g);
  }
  return order.map((status) => ({ status, groups: map.get(status)! }));
}

/** Schedule view: "No date" + "Overdue" (only projects genuinely past due). */
export function getScheduleQueueSections(projects: Project[]) {
  const noDate = projects.filter((p) => !hasDate(p));
  const secondSection = projects.filter((p) => hasDate(p) && isOverdue(p));
  return { noDate, secondSection };
}

/** Routes view: "No date" + "Active Projects" (any project with a date, past/present/future). */
export function getRoutesQueueSections(projects: Project[]) {
  const noDate = projects.filter((p) => !hasDate(p));
  const secondSection = projects.filter((p) => hasDate(p));
  return { noDate, secondSection };
}

export interface GridRow {
  project: Project;
  depth: number;
}

/** Flattens dated projects into rows, nesting subprojects directly under their parent. */
export function buildGridRows(datedProjects: Project[]): GridRow[] {
  const tree = buildQueueTree(datedProjects);
  const rows: GridRow[] = [];
  for (const g of tree) {
    rows.push({ project: g.project, depth: 0 });
    for (const child of g.children) rows.push({ project: child, depth: 1 });
  }
  return rows;
}
