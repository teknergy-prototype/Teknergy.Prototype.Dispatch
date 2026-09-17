import type { CrewAssignment, EquipmentAssignment, ISODate } from "./types";

export function crewForCell(
  crewAssignments: CrewAssignment[],
  projectId: string,
  day: ISODate
): CrewAssignment[] {
  return crewAssignments.filter((a) => a.projectId === projectId && a.day === day);
}

export function equipmentForCell(
  equipmentAssignments: EquipmentAssignment[],
  projectId: string,
  day: ISODate
): EquipmentAssignment[] {
  return equipmentAssignments.filter((a) => {
    if (a.projectId !== projectId) return false;
    if (a.scope === "project") return a.day === day;
    if (a.scope === "member-day") return a.day === day;
    return true; // member-whole-project applies every day
  });
}
