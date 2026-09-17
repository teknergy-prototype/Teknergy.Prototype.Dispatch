import type { AvailabilityEntry, ISODate } from "./types";

export function isEmployeeOffOn(
  entries: AvailabilityEntry[],
  employeeId: string,
  day: ISODate
): boolean {
  return entries.some(
    (e) =>
      e.employeeId === employeeId &&
      e.category === "dayoff" &&
      day >= e.startDate &&
      day <= e.endDate
  );
}

export function entriesForCell(
  entries: AvailabilityEntry[],
  employeeId: string,
  day: ISODate
): AvailabilityEntry[] {
  return entries.filter(
    (e) => e.employeeId === employeeId && day >= e.startDate && day <= e.endDate
  );
}
