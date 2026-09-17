import type { Employee, Equipment, ISODate, Project, RouteStop } from "./types";

export type DragItemData =
  | { kind: "project"; project: Project }
  | { kind: "crew"; employee: Employee }
  | { kind: "equipment"; equipment: Equipment }
  | { kind: "route-stop"; stop: RouteStop };

export type DropTargetData =
  | { kind: "day-header"; day: ISODate }
  | { kind: "project-card"; projectId: string; day: ISODate }
  | { kind: "crew-chip"; projectId: string; employeeId: string; day: ISODate }
  | { kind: "routes-cell"; employeeId: string; day: ISODate }
  | { kind: "route-stop"; stopId: string; employeeId: string; day: ISODate }
  | { kind: "availability-cell"; employeeId: string; day: ISODate };
