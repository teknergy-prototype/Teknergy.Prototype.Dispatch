// Minutes-from-midnight helpers for the Crew Planning prototype's single demo day.

export function toMinutes(hour: number, minute: number): number {
  return hour * 60 + minute;
}

export function formatMinutes(totalMinutes: number): string {
  const h24 = Math.floor(totalMinutes / 60) % 24;
  const m = totalMinutes % 60;
  const period = h24 >= 12 ? "PM" : "AM";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${period}`;
}

export function formatRange(start: number, end: number): string {
  return `${formatMinutes(start)} – ${formatMinutes(end)}`;
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export const DAY_START = toMinutes(7, 0);
export const DAY_END = toMinutes(18, 0);
export const DAY_SPAN = DAY_END - DAY_START;

export function pctOfDay(minutes: number): number {
  return ((minutes - DAY_START) / DAY_SPAN) * 100;
}
