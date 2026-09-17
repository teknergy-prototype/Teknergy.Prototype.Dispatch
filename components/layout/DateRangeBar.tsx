"use client";

import { addDays } from "date-fns";
import { useDispatchStore } from "@/lib/store";
import {
  formatRangeLabel,
  fromISO,
  getVisibleDays,
  shiftRange,
  toISO,
  today as todayISO,
} from "@/lib/dates";
import type { RangeMode } from "@/lib/types";
import { cn } from "@/lib/cn";
import { Button } from "../ui/Button";
import { ChevronLeftIcon, ChevronRightIcon } from "../ui/Icons";
import { AiRecommendationButton } from "../ai/AiRecommendationButton";

const MODES: { key: RangeMode; label: string }[] = [
  { key: "1day", label: "1 day" },
  { key: "3day", label: "3 days" },
  { key: "7day", label: "7 days" },
  { key: "custom", label: "Custom" },
];

export function DateRangeBar() {
  const activeView = useDispatchStore((s) => s.activeView);
  const range = useDispatchStore((s) => s.scheduleRoutesRange);
  const setRange = useDispatchStore((s) => s.setScheduleRoutesRange);
  const availabilityAnchor = useDispatchStore((s) => s.availabilityAnchor);
  const setAvailabilityAnchor = useDispatchStore((s) => s.setAvailabilityAnchor);
  const hideWeekends = useDispatchStore((s) => s.hideWeekends);
  const toggleHideWeekends = useDispatchStore((s) => s.toggleHideWeekends);

  const isAvailability = activeView === "availability";

  const days = isAvailability
    ? getVisibleDays({ anchor: availabilityAnchor, mode: "7day", customStart: null, customEnd: null }, true)
    : getVisibleDays(range);

  const label = formatRangeLabel(days);

  function goPrev() {
    if (isAvailability) {
      setAvailabilityAnchor(toISO(addDays(fromISO(availabilityAnchor), -7)));
    } else {
      setRange(shiftRange(range, -1));
    }
  }
  function goNext() {
    if (isAvailability) {
      setAvailabilityAnchor(toISO(addDays(fromISO(availabilityAnchor), 7)));
    } else {
      setRange(shiftRange(range, 1));
    }
  }
  function goToday() {
    if (isAvailability) {
      setAvailabilityAnchor(todayISO());
    } else {
      setRange({ ...range, anchor: todayISO() });
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-[var(--border-subtle)] px-4 py-2.5">
      {!isAvailability && (
        <div className="flex items-center gap-0.5 rounded-md border border-[var(--border)] p-0.5">
          {MODES.map((m) => (
            <button
              key={m.key}
              onClick={() => setRange({ ...range, mode: m.key })}
              className={cn(
                "rounded px-2.5 py-1 text-xs font-medium transition-colors",
                range.mode === m.key
                  ? "bg-[var(--foreground)] text-[var(--background)]"
                  : "text-[var(--muted)] hover:text-[var(--foreground)]"
              )}
            >
              {m.label}
            </button>
          ))}
        </div>
      )}

      {!isAvailability && range.mode === "custom" && (
        <div className="flex items-center gap-1.5 text-xs">
          <input
            type="date"
            value={range.customStart ?? days[0]}
            onChange={(e) =>
              setRange({ ...range, customStart: e.target.value, anchor: e.target.value })
            }
            className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-[var(--foreground)]"
          />
          <span className="text-[var(--muted)]">to</span>
          <input
            type="date"
            value={range.customEnd ?? days[days.length - 1]}
            onChange={(e) => setRange({ ...range, customEnd: e.target.value })}
            className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-[var(--foreground)]"
          />
        </div>
      )}

      <div className="flex items-center gap-1">
        <Button variant="ghost" className="!px-1.5" onClick={goPrev} aria-label="Previous">
          <ChevronLeftIcon size={15} />
        </Button>
        <Button variant="secondary" onClick={goToday} className="text-xs">
          Today
        </Button>
        <Button variant="ghost" className="!px-1.5" onClick={goNext} aria-label="Next">
          <ChevronRightIcon size={15} />
        </Button>
      </div>

      <div className="text-sm font-medium text-[var(--foreground)]">{label}</div>

      {activeView === "schedule" && <AiRecommendationButton />}

      <div className="ml-auto flex items-center gap-2">
        <label className="flex cursor-pointer items-center gap-1.5 text-xs text-[var(--muted)]">
          <input
            type="checkbox"
            checked={hideWeekends}
            onChange={toggleHideWeekends}
            className="h-3.5 w-3.5 accent-[var(--foreground)]"
          />
          Hide Sat/Sun
        </label>
      </div>
    </div>
  );
}
