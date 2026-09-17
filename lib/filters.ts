import type { CrewAssignment, Employee, Project } from "./types";

export function matchesSearch(
  project: Project,
  search: string,
  crewAssignments: CrewAssignment[],
  employees: Employee[]
): boolean {
  const q = search.trim().toLowerCase();
  if (!q) return true;
  if (project.name.toLowerCase().includes(q)) return true;
  if (project.id.toLowerCase().includes(q)) return true;
  const addr = `${project.address.street} ${project.address.city} ${project.address.state} ${project.address.zip}`.toLowerCase();
  if (addr.includes(q)) return true;
  const crewIds = crewAssignments
    .filter((a) => a.projectId === project.id)
    .map((a) => a.employeeId);
  const crewNames = employees
    .filter((e) => crewIds.includes(e.id))
    .map((e) => e.name.toLowerCase());
  return crewNames.some((n) => n.includes(q));
}

export function matchesStatusCategory(
  project: Project,
  statuses: string[],
  categories: string[]
): boolean {
  if (statuses.length > 0 && !statuses.includes(project.status)) return false;
  if (categories.length > 0 && !categories.includes(project.serviceCategory.id)) return false;
  return true;
}
