import { useCrewPlanningStore } from "@/lib/crew-planning/store";
import type { CrewTeam } from "@/lib/crew-planning/types";
import { Avatar } from "../../ui/Avatar";

export function CrewDetailsPanel({ crew }: { crew: CrewTeam }) {
  const teamMembers = useCrewPlanningStore((s) => s.teamMembers);
  const members = crew.memberIds.map((id) => teamMembers.find((m) => m.id === id)).filter(Boolean);

  return (
    <div className="rounded-md border border-[var(--border-subtle)] p-3">
      <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-red-600 dark:text-red-400">
        Crew details
      </h3>
      <div className="mb-2 text-sm font-semibold text-[var(--foreground)]">{crew.name}</div>
      <div className="flex flex-col gap-2">
        {members.map(
          (m) =>
            m && (
              <div key={m.id} className="flex items-center gap-2">
                <Avatar name={m.name} color={m.avatarColor} size={22} />
                <div>
                  <div className="text-xs font-medium text-[var(--foreground)]">{m.name}</div>
                  <div className="text-[10px] text-[var(--muted)]">{m.role}</div>
                </div>
              </div>
            )
        )}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 border-t border-[var(--border-subtle)] pt-2 text-[11px]">
        <div>
          <div className="text-[9px] uppercase tracking-wide text-[var(--muted-2)]">Vehicle</div>
          <div className="text-[var(--foreground)]">{crew.vehicle}</div>
        </div>
        <div>
          <div className="text-[9px] uppercase tracking-wide text-[var(--muted-2)]">Dispatcher</div>
          <div className="text-[var(--foreground)]">{crew.dispatcherName}</div>
        </div>
      </div>
    </div>
  );
}
