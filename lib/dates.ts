import {
  addDays,
  addWeeks,
  differenceInCalendarDays,
  format,
  isSameDay,
  parseISO,
  startOfWeek,
  subWeeks,
} from "date-fns";
import type { ISODate, RangeMode } from "./types";

export const DATE_FMT = "yyyy-MM-dd";

export function toISO(date: Date): ISODate {
  return format(date, DATE_FMT);
}

export function fromISO(date: ISODate): Date {
  return parseISO(date);
}

export function today(): ISODate {
  return toISO(new Date());
}

export function isTodayISO(date: ISODate): boolean {
  return isSameDay(fromISO(date), new Date());
}

export function isBeforeToday(date: ISODate): boolean {
  return differenceInCalendarDays(fromISO(date), new Date()) < 0;
}

export function weekStart(date: Date): Date {
  return startOfWeek(date, { weekStartsOn: 1 });
}

export interface DateRange {
  anchor: ISODate;
  mode: RangeMode;
  customStart: ISODate | null;
  customEnd: ISODate | null;
}

export function getVisibleDays(range: DateRange, forceWeek = false): ISODate[] {
  const anchorDate = fromISO(range.anchor);

  if (forceWeek) {
    const start = weekStart(anchorDate);
    return Array.from({ length: 7 }, (_, i) => toISO(addDays(start, i)));
  }

  switch (range.mode) {
    case "1day":
      return [toISO(anchorDate)];
    case "3day":
      return Array.from({ length: 3 }, (_, i) => toISO(addDays(anchorDate, i)));
    case "7day": {
      const start = weekStart(anchorDate);
      return Array.from({ length: 7 }, (_, i) => toISO(addDays(start, i)));
    }
    case "custom": {
      const start = range.customStart ? fromISO(range.customStart) : anchorDate;
      const end = range.customEnd ? fromISO(range.customEnd) : anchorDate;
      const len = Math.max(0, differenceInCalendarDays(end, start));
      return Array.from({ length: len + 1 }, (_, i) => toISO(addDays(start, i)));
    }
    default:
      return [toISO(anchorDate)];
  }
}

export function shiftRange(range: DateRange, direction: 1 | -1, forceWeek = false): DateRange {
  const anchorDate = fromISO(range.anchor);

  if (forceWeek) {
    const next = direction === 1 ? addWeeks(anchorDate, 1) : subWeeks(anchorDate, 1);
    return { ...range, anchor: toISO(next) };
  }

  let step = 1;
  if (range.mode === "3day") step = 3;
  else if (range.mode === "7day") step = 7;
  else if (range.mode === "custom") {
    const start = range.customStart ? fromISO(range.customStart) : anchorDate;
    const end = range.customEnd ? fromISO(range.customEnd) : anchorDate;
    step = Math.max(1, differenceInCalendarDays(end, start) + 1);
  }

  const delta = step * direction;
  const nextAnchor = toISO(addDays(anchorDate, delta));

  if (range.mode === "custom" && range.customStart && range.customEnd) {
    return {
      ...range,
      anchor: nextAnchor,
      customStart: toISO(addDays(fromISO(range.customStart), delta)),
      customEnd: toISO(addDays(fromISO(range.customEnd), delta)),
    };
  }

  return { ...range, anchor: nextAnchor };
}

export function formatRangeLabel(days: ISODate[]): string {
  if (days.length === 0) return "";
  const first = fromISO(days[0]);
  const last = fromISO(days[days.length - 1]);
  if (days.length === 1) return format(first, "MMM d, yyyy");
  const sameMonth = format(first, "MMM yyyy") === format(last, "MMM yyyy");
  const sameYear = format(first, "yyyy") === format(last, "yyyy");
  if (sameMonth) {
    return `${format(first, "MMM d")} – ${format(last, "d, yyyy")}`;
  }
  if (sameYear) {
    return `${format(first, "MMM d")} – ${format(last, "MMM d, yyyy")}`;
  }
  return `${format(first, "MMM d, yyyy")} – ${format(last, "MMM d, yyyy")}`;
}

export function isWeekend(date: ISODate): boolean {
  const d = fromISO(date).getDay();
  return d === 0 || d === 6;
}

export function dayLabel(date: ISODate): { weekday: string; dateNum: string } {
  const d = fromISO(date);
  return { weekday: format(d, "EEE"), dateNum: format(d, "MMM d") };
}
