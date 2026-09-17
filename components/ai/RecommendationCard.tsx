"use client";

import { useDispatchStore } from "@/lib/store";
import { cn } from "@/lib/cn";
import type { ProposedChange } from "@/lib/types";
import { Avatar } from "../ui/Avatar";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";

const STATUS_STYLES: Record<ProposedChange["status"], { bg: string; text: string; label: string }> = {
  pending: { bg: "#f3f4f6", text: "#374151", label: "Pending" },
  accepted: { bg: "#d1fae5", text: "#065f46", label: "Accepted" },
  rejected: { bg: "#fee2e2", text: "#b91c1c", label: "Rejected" },
};

const TYPE_LABELS: Record<ProposedChange["type"], string> = {
  "new-assignment": "New assignment",
  reschedule: "Rescheduled",
  "reassign-crew": "Crew reassigned",
  unassigned: "Unassigned",
};

export function RecommendationCard({ change }: { change: ProposedChange }) {
  const project = useDispatchStore((s) => s.projects.find((p) => p.id === change.projectId));
  const employees = useDispatchStore((s) => s.employees);
  const proposalStatus = useDispatchStore((s) => s.proposal?.status);
  const acceptChange = useDispatchStore((s) => s.acceptChange);
  const rejectChange = useDispatchStore((s) => s.rejectChange);
  const highlightedChangeId = useDispatchStore((s) => s.highlightedChangeId);
  const setHighlightedChangeId = useDispatchStore((s) => s.setHighlightedChangeId);

  if (!project) return null;

  const crew = change.proposedCrewIds
    .map((id) => employees.find((e) => e.id === id))
    .filter((e): e is NonNullable<typeof e> => Boolean(e));
  const statusStyle = STATUS_STYLES[change.status];
  const canDecide = change.type !== "unassigned" && proposalStatus === "draft";
  const linkedOnCalendar = change.proposedDay != null;
  const isHighlighted = highlightedChangeId === change.id;

  function handleClick() {
    if (!linkedOnCalendar) return;
    const next = isHighlighted ? null : change.id;
    setHighlightedChangeId(next);
    if (next) {
      document
        .getElementById(`proposed-card-${change.id}`)
        ?.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
    }
  }

  return (
    <div
      id={`recommendation-${change.id}`}
      onClick={handleClick}
      className={cn(
        "flex flex-col gap-2 rounded-md border p-3 transition-colors",
        linkedOnCalendar && "cursor-pointer",
        isHighlighted
          ? "border-violet-400 bg-violet-50 ring-2 ring-violet-400 dark:border-violet-600 dark:bg-violet-950/30 dark:ring-violet-600"
          : "border-[var(--border-subtle)]"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="truncate text-xs font-semibold text-[var(--foreground)]">{project.name}</div>
          <div className="text-[10px] text-[var(--muted)]">
            #{project.id} · {TYPE_LABELS[change.type]}
          </div>
        </div>
        <Badge bg={statusStyle.bg} text={statusStyle.text} className="shrink-0">
          {statusStyle.label}
        </Badge>
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-[var(--foreground)]">
        <div>
          <span className="text-[var(--muted)]">Date: </span>
          {change.proposedDay ?? "Unassigned"}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[var(--muted)]">Crew: </span>
          {crew.length > 0 ? (
            <span className="flex items-center gap-1">
              {crew.map((e) => (
                <span key={e.id} className="flex items-center gap-1">
                  <Avatar name={e.name} color={e.avatarColor} size={16} />
                  {e.name}
                </span>
              ))}
            </span>
          ) : (
            "—"
          )}
        </div>
      </div>

      <p className="text-[11px] leading-snug text-[var(--muted)]">{change.reason}</p>

      {canDecide && (
        <div className="flex gap-2 pt-1">
          <Button
            variant={change.status === "accepted" ? "primary" : "secondary"}
            className="flex-1 py-1 text-[11px]"
            onClick={(e) => {
              e.stopPropagation();
              acceptChange(change.id);
            }}
          >
            Accept
          </Button>
          <Button
            variant={change.status === "rejected" ? "danger" : "secondary"}
            className="flex-1 py-1 text-[11px]"
            onClick={(e) => {
              e.stopPropagation();
              rejectChange(change.id);
            }}
          >
            Reject
          </Button>
        </div>
      )}
    </div>
  );
}
