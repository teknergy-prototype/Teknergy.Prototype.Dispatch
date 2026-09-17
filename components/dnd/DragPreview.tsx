import type { DragItemData } from "@/lib/dnd";
import { Avatar } from "../ui/Avatar";

export function DragPreview({ item }: { item: DragItemData }) {
  if (item.kind === "project") {
    return (
      <div
        className="flex items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs font-medium shadow-lg"
        style={{ borderLeftWidth: 3, borderLeftColor: item.project.serviceCategory.color }}
      >
        #{item.project.id} {item.project.name}
      </div>
    );
  }
  if (item.kind === "crew") {
    return (
      <div className="flex items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--surface)] px-2.5 py-2 text-xs font-medium shadow-lg">
        <Avatar name={item.employee.name} color={item.employee.avatarColor} size={18} />
        {item.employee.name}
      </div>
    );
  }
  if (item.kind === "equipment") {
    return (
      <div className="flex items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--surface)] px-2.5 py-2 text-xs font-medium shadow-lg">
        {item.equipment.name}
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--surface)] px-2.5 py-2 text-xs font-medium shadow-lg">
      Stop {item.stop.stopNumber}
    </div>
  );
}
