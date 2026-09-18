"use client";

import { useState } from "react";
import { ACKNOWLEDGMENTS } from "@/lib/crew-planning/fixtures";
import { useCrewPlanningStore } from "@/lib/crew-planning/store";
import type { AcknowledgmentStatus, CrewTeam } from "@/lib/crew-planning/types";
import { Avatar } from "../../ui/Avatar";
import { Badge } from "../../ui/Badge";
import { Button } from "../../ui/Button";

const STATUS_STYLES: Record<AcknowledgmentStatus, { bg: string; text: string; label: string }> = {
  pending: { bg: "#fef3c7", text: "#92400e", label: "Pending" },
  "sent-by-email": { bg: "#dbeafe", text: "#1d4ed8", label: "Sent by email" },
  acknowledged: { bg: "#d1fae5", text: "#065f46", label: "Acknowledged" },
};

export function AcknowledgmentPanel({ crew }: { crew: CrewTeam }) {
  const teamMembers = useCrewPlanningStore((s) => s.teamMembers);
  const [reminderSent, setReminderSent] = useState(false);
  const statuses = ACKNOWLEDGMENTS[crew.id] ?? {};
  const members = crew.memberIds.map((id) => teamMembers.find((m) => m.id === id)).filter(Boolean);
  const acknowledgedCount = members.filter((m) => m && statuses[m.id] === "acknowledged").length;

  return (
    <div className="rounded-md border border-[var(--border-subtle)] p-3">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-[10px] font-semibold uppercase tracking-wide text-red-600 dark:text-red-400">Acknowledgment</h3>
        <span className="text-[10px] text-[var(--muted-2)]">
          {acknowledgedCount} of {members.length} acknowledged
        </span>
      </div>
      <div className="flex flex-col gap-1.5">
        {members.map(
          (m) =>
            m && (
              <div key={m.id} className="flex items-center gap-2">
                <Avatar name={m.name} color={m.avatarColor} size={20} />
                <span className="flex-1 text-xs text-[var(--foreground)]">{m.name}</span>
                <Badge bg={STATUS_STYLES[statuses[m.id] ?? "pending"].bg} text={STATUS_STYLES[statuses[m.id] ?? "pending"].text}>
                  {STATUS_STYLES[statuses[m.id] ?? "pending"].label}
                </Badge>
              </div>
            )
        )}
      </div>
      <Button
        variant="secondary"
        className="mt-3 w-full text-[11px]"
        onClick={() => {
          setReminderSent(true);
          setTimeout(() => setReminderSent(false), 2000);
        }}
      >
        {reminderSent ? "Reminder sent ✓" : "Send acknowledgment reminder"}
      </Button>
    </div>
  );
}
