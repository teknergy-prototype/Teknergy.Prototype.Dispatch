"use client";

import type { ReactNode } from "react";
import { formatRangeLabel } from "@/lib/dates";
import { useDispatchStore } from "@/lib/store";
import { AiChat } from "./AiChat";
import { RecommendationCard } from "./RecommendationCard";
import { Button } from "../ui/Button";
import { CheckIcon, XIcon } from "../ui/Icons";

function StatTile({ label, value, className }: { label: string; value: ReactNode; className?: string }) {
  return (
    <div className={`rounded-md border border-[var(--border-subtle)] p-2.5 ${className ?? ""}`}>
      <div className="text-[10px] uppercase tracking-wide text-[var(--muted-2)]">{label}</div>
      <div className="text-base font-semibold text-[var(--foreground)]">{value}</div>
    </div>
  );
}

export function AiRecommendationPanel() {
  const proposal = useDispatchStore((s) => s.proposal);
  const closeAiPanel = useDispatchStore((s) => s.closeAiPanel);
  const discardProposal = useDispatchStore((s) => s.discardProposal);
  const applyRecommendation = useDispatchStore((s) => s.applyRecommendation);
  const publishSchedule = useDispatchStore((s) => s.publishSchedule);

  if (!proposal) return null;

  const acceptedCount = proposal.changes.filter((c) => c.status === "accepted").length;
  const canApply = proposal.status === "draft" && acceptedCount > 0;

  return (
    <aside className="flex w-[440px] shrink-0 flex-col border-l border-[var(--border-subtle)] bg-[var(--surface)]">
      <div className="flex items-start justify-between gap-2 border-b border-[var(--border-subtle)] p-4">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-[var(--foreground)]">Schedule recommendation</h2>
          <p className="mt-0.5 text-xs text-[var(--muted)]">{formatRangeLabel(proposal.scopeDays)}</p>
          <p className="mt-1 text-[11px] text-[var(--muted-2)]">
            Only Projects within this date range will be scheduled or moved.
          </p>
        </div>
        <button
          onClick={closeAiPanel}
          className="shrink-0 rounded-md p-1 text-[var(--muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)]"
          aria-label="Close panel"
        >
          <XIcon size={15} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-2 gap-2">
          <StatTile label="Projects evaluated" value={proposal.summary.evaluated} />
          <StatTile label="Projects assigned" value={proposal.summary.assigned} />
          <StatTile label="Projects still unassigned" value={proposal.summary.unassigned} />
          <StatTile label="Conflicts resolved" value={proposal.summary.conflictsResolved} />
          <StatTile
            label="Estimated overtime"
            value={`${proposal.summary.estimatedOvertimeHours}h`}
            className="col-span-2"
          />
        </div>

        {proposal.status === "applied" && (
          <div className="mt-4 flex items-center gap-2 rounded-md bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
            <CheckIcon size={14} />
            Recommendation applied to the schedule.
          </div>
        )}
        {proposal.status === "published" && (
          <div className="mt-4 flex items-center gap-2 rounded-md bg-blue-50 px-3 py-2 text-xs font-medium text-blue-700 dark:bg-blue-950/40 dark:text-blue-400">
            <CheckIcon size={14} />
            Schedule published.
          </div>
        )}

        <div className="mt-5">
          <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-[var(--muted-2)]">
            Recommendations
          </h3>
          <div className="flex flex-col gap-2">
            {proposal.changes.length === 0 && (
              <p className="text-xs text-[var(--muted)]">No changes proposed for this range.</p>
            )}
            {proposal.changes.map((c) => (
              <RecommendationCard key={c.id} change={c} />
            ))}
          </div>
        </div>

        <div className="mt-5">
          <AiChat />
        </div>
      </div>

      <div className="border-t border-[var(--border-subtle)] p-3">
        {proposal.status === "draft" && (
          <div className="flex gap-2">
            <Button variant="danger" className="flex-1" onClick={discardProposal}>
              Discard
            </Button>
            <Button variant="primary" className="flex-1" onClick={applyRecommendation} disabled={!canApply}>
              Apply recommendation
            </Button>
          </div>
        )}
        {proposal.status === "applied" && (
          <div className="flex gap-2">
            <Button variant="ghost" className="flex-1" onClick={closeAiPanel}>
              Close
            </Button>
            <Button variant="primary" className="flex-1" onClick={publishSchedule}>
              Publish schedule
            </Button>
          </div>
        )}
        {proposal.status === "published" && (
          <Button variant="secondary" className="w-full" onClick={closeAiPanel}>
            Close
          </Button>
        )}
      </div>
    </aside>
  );
}
