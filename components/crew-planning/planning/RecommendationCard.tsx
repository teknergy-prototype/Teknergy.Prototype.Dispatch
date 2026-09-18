"use client";

import { RECOMMENDATION_STYLES } from "@/lib/crew-planning/colors";
import { useCrewPlanningStore } from "@/lib/crew-planning/store";
import type { PlanRecommendation } from "@/lib/crew-planning/types";
import { Badge } from "../../ui/Badge";
import { Button } from "../../ui/Button";

export function RecommendationCard({ rec }: { rec: PlanRecommendation }) {
  const acceptRecommendation = useCrewPlanningStore((s) => s.acceptRecommendation);
  const skipRecommendation = useCrewPlanningStore((s) => s.skipRecommendation);
  const aiPlanStatus = useCrewPlanningStore((s) => s.aiPlan?.status);
  const setSelectedJobId = useCrewPlanningStore((s) => s.setSelectedJobId);
  const style = RECOMMENDATION_STYLES[rec.type];

  return (
    <div
      className="flex flex-col gap-1.5 rounded-md border border-[var(--border-subtle)] p-3"
      style={{ borderLeftWidth: 3, borderLeftColor: style.text }}
    >
      <div className="flex items-center justify-between gap-2">
        <Badge bg={style.bg} text={style.text}>
          {style.label}
        </Badge>
        {rec.status !== "pending" && (
          <span className="text-[10px] font-medium text-[var(--muted-2)]">
            {rec.status === "accepted" ? "Accepted" : "Skipped"}
          </span>
        )}
      </div>
      <button
        onClick={() => rec.jobId && setSelectedJobId(rec.jobId)}
        className="text-left text-xs font-semibold leading-snug text-[var(--foreground)] hover:underline"
      >
        {rec.title}
      </button>
      <p className="text-[11px] leading-snug text-[var(--muted)]">{rec.detail}</p>

      {rec.canDecide && aiPlanStatus === "draft" && (
        <div className="flex gap-2 pt-1">
          <Button
            variant="secondary"
            className="flex-1 py-1 text-[11px]"
            onClick={() => skipRecommendation(rec.id)}
          >
            Skip
          </Button>
          <Button
            variant={rec.status === "accepted" ? "primary" : "secondary"}
            className="flex-1 py-1 text-[11px]"
            onClick={() => acceptRecommendation(rec.id)}
          >
            Accept
          </Button>
        </div>
      )}
    </div>
  );
}
