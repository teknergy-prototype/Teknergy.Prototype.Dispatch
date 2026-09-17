"use client";

import { isEmployeeOffOn } from "@/lib/availability";
import { useDispatchStore } from "@/lib/store";
import { today } from "@/lib/dates";
import type { Employee } from "@/lib/types";
import { Draggable } from "../dnd/Draggable";
import { Avatar } from "../ui/Avatar";
import { Badge } from "../ui/Badge";
import { GripIcon } from "../ui/Icons";
import { DAYOFF_BADGE } from "@/lib/colors";

export function EmployeeQueueCard({ employee }: { employee: Employee }) {
  const availabilityEntries = useDispatchStore((s) => s.availabilityEntries);
  const isOffToday = isEmployeeOffOn(availabilityEntries, employee.id, today());

  return (
    <Draggable
      id={`queue-crew-${employee.id}`}
      data={{ kind: "crew", employee }}
      className="group flex items-center gap-2 rounded-md border border-[var(--border-subtle)] bg-[var(--surface)] px-2.5 py-2 hover:border-[var(--border)] hover:shadow-sm"
    >
      <Avatar name={employee.name} color={employee.avatarColor} />
      <span className="flex-1 truncate text-xs font-medium text-[var(--foreground)]">
        {employee.name}
      </span>
      {isOffToday && <Badge bg={DAYOFF_BADGE.bg} text={DAYOFF_BADGE.text}>Day Off</Badge>}
      <span className="shrink-0 cursor-grab text-[var(--muted-2)] active:cursor-grabbing">
        <GripIcon size={13} />
      </span>
    </Draggable>
  );
}
