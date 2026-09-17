"use client";

import { ACTIVITY_BADGE, DAYOFF_BADGE, PTO_CHIP } from "@/lib/colors";
import { useDispatchStore } from "@/lib/store";
import type { AvailabilityEntry } from "@/lib/types";
import { Badge } from "../ui/Badge";
import { XIcon } from "../ui/Icons";

export function AvailabilityCard({ entry }: { entry: AvailabilityEntry }) {
  const removeAvailabilityEntry = useDispatchStore((s) => s.removeAvailabilityEntry);
  const isDayOff = entry.category === "dayoff";
  const badgeColor = isDayOff ? DAYOFF_BADGE : ACTIVITY_BADGE;

  return (
    <div className="group/card flex flex-col gap-1 rounded-md border border-[var(--border-subtle)] bg-[var(--surface)] p-2 shadow-sm">
      <div className="flex items-start gap-1">
        <Badge bg={badgeColor.bg} text={badgeColor.text} className="flex-1 justify-center">
          {isDayOff ? "DAY OFF" : "OTHER ACTIVITY"}
        </Badge>
        <button
          onClick={() => removeAvailabilityEntry(entry.id)}
          className="shrink-0 text-[var(--muted-2)] opacity-0 hover:text-red-600 group-hover/card:opacity-100"
          aria-label="Remove"
        >
          <XIcon size={12} />
        </button>
      </div>
      <div className="text-xs font-medium text-[var(--foreground)]">{entry.type}</div>
      {entry.reason && <div className="text-[11px] text-[var(--muted)]">{entry.reason}</div>}
      {entry.isPTO && (
        <Badge bg={PTO_CHIP.bg} text={PTO_CHIP.text} className="w-fit">
          PTO
        </Badge>
      )}
    </div>
  );
}
