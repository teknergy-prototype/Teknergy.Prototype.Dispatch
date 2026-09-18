"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { formatDuration } from "@/lib/crew-planning/time";
import { useCrewPlanningStore } from "@/lib/crew-planning/store";
import { cn } from "@/lib/cn";
import { Button } from "../../ui/Button";
import { CheckIcon, SendIcon, SparkleIcon } from "../../ui/Icons";
import { RecommendationCard } from "./RecommendationCard";

const SUGGESTIONS = ["Prioritize overdue Jobs", "Avoid overtime", "Keep crews together"];

function KpiTile({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-md border border-[var(--border-subtle)] p-2.5">
      <div className="text-[9px] uppercase tracking-wide text-[var(--muted-2)]">{label}</div>
      <div className="text-base font-semibold text-[var(--foreground)]">{value}</div>
    </div>
  );
}

export function AIPlanPanel() {
  const dateLabel = useCrewPlanningStore((s) => s.dateLabel);
  const aiPlan = useCrewPlanningStore((s) => s.aiPlan);
  const discardPlan = useCrewPlanningStore((s) => s.discardPlan);
  const applyPlan = useCrewPlanningStore((s) => s.applyPlan);
  const sendChatMessage = useCrewPlanningStore((s) => s.sendChatMessage);
  const generateStatus = useCrewPlanningStore((s) => s.generateStatus);
  const [text, setText] = useState("");

  if (generateStatus === "generating") {
    return (
      <aside className="flex w-[340px] shrink-0 flex-col items-center justify-center gap-2 border-l border-[var(--border-subtle)] bg-[var(--surface)] p-6 text-center">
        <SparkleIcon size={20} className="animate-pulse text-violet-500" />
        <p className="text-xs text-[var(--muted)]">Evaluating Jobs, crew capacity and travel time…</p>
      </aside>
    );
  }

  if (!aiPlan) {
    return (
      <aside className="flex w-[340px] shrink-0 flex-col items-center justify-center gap-2 border-l border-[var(--border-subtle)] bg-[var(--surface)] p-6 text-center">
        <SparkleIcon size={20} className="text-[var(--muted-2)]" />
        <p className="text-xs font-medium text-[var(--foreground)]">AI Plan Review</p>
        <p className="text-[11px] text-[var(--muted)]">
          Click &ldquo;Generate daily crew plan&rdquo; above to evaluate today&apos;s Jobs and get recommendations.
        </p>
      </aside>
    );
  }

  const acceptedCount = aiPlan.recommendations.filter((r) => r.status === "accepted").length;
  const canApply = aiPlan.status === "draft" && acceptedCount > 0;
  const disabled = aiPlan.status !== "draft";

  function submit(value?: string) {
    const msg = (value ?? text).trim();
    if (!msg || disabled) return;
    sendChatMessage(msg);
    setText("");
  }

  return (
    <aside className="flex w-[340px] shrink-0 flex-col border-l border-[var(--border-subtle)] bg-[var(--surface)]">
      <div className="border-b border-[var(--border-subtle)] p-4">
        <div className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-violet-600 dark:text-violet-400">
          <SparkleIcon size={12} /> AI Plan Review
        </div>
        <h2 className="text-sm font-semibold text-[var(--foreground)]">Schedule recommendation</h2>
        <p className="mt-0.5 text-xs text-[var(--muted)]">
          {dateLabel.split(",").slice(0, 1)} · {aiPlan.summary.evaluated} Jobs evaluated
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-2 gap-2">
          <KpiTile label="Jobs assigned" value={aiPlan.summary.assigned} />
          <KpiTile label="Conflicts resolved" value={aiPlan.summary.conflictsResolved} />
          <KpiTile label="Job unassigned" value={aiPlan.summary.unassigned} />
          <KpiTile label="Avg. crew time" value={formatDuration(aiPlan.summary.avgCrewTimeMinutes)} />
        </div>

        {aiPlan.status === "applied" && (
          <div className="mt-4 flex items-center gap-2 rounded-md bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
            <CheckIcon size={14} />
            Accepted recommendations applied to the plan.
          </div>
        )}

        <div className="mt-5">
          <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-[var(--muted-2)]">
            {aiPlan.recommendations.length} Recommendation{aiPlan.recommendations.length === 1 ? "" : "s"}
          </h3>
          <div className="flex flex-col gap-2">
            {aiPlan.recommendations.map((rec) => (
              <RecommendationCard key={rec.id} rec={rec} />
            ))}
          </div>
        </div>

        <div className="mt-5">
          <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-[var(--muted-2)]">
            Adjust with AI
          </h3>
          <div className="flex max-h-40 flex-col gap-2 overflow-y-auto rounded-md border border-[var(--border-subtle)] p-2">
            {aiPlan.chat.map((m) => (
              <div
                key={m.id}
                className={cn(
                  "max-w-[88%] rounded-md px-2.5 py-1.5 text-[11px] leading-snug",
                  m.role === "user"
                    ? "self-end bg-[var(--foreground)] text-[var(--background)]"
                    : "self-start bg-[var(--surface-hover)] text-[var(--foreground)]"
                )}
              >
                {m.text}
              </div>
            ))}
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                disabled={disabled}
                onClick={() => submit(s)}
                className="rounded-full border border-[var(--border)] px-2.5 py-1 text-[10px] text-[var(--foreground)] hover:bg-[var(--surface-hover)] disabled:opacity-40"
              >
                {s}
              </button>
            ))}
          </div>
          <form
            className="mt-2 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              submit();
            }}
          >
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Tell AI how to adjust the plan..."
              disabled={disabled}
              className="flex-1 rounded-md border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1.5 text-xs outline-none focus:border-[var(--muted-2)] disabled:opacity-50"
            />
            <Button variant="primary" type="submit" disabled={disabled || !text.trim()} className="!px-2.5">
              <SendIcon size={13} />
            </Button>
          </form>
          <p className="mt-1.5 text-[10px] text-[var(--muted-2)]">Nothing changes in Jobber until you apply.</p>
        </div>
      </div>

      <div className="border-t border-[var(--border-subtle)] p-3">
        {aiPlan.status === "draft" ? (
          <div className="flex gap-2">
            <Button variant="danger" className="flex-1" onClick={discardPlan}>
              Discard
            </Button>
            <Button variant="primary" className="flex-1" onClick={applyPlan} disabled={!canApply}>
              Apply recommendation
            </Button>
          </div>
        ) : (
          <Button variant="secondary" className="w-full" onClick={discardPlan}>
            Close
          </Button>
        )}
      </div>
    </aside>
  );
}
