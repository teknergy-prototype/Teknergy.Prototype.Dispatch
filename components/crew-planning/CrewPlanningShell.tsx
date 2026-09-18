"use client";

import { useCrewPlanningStore } from "@/lib/crew-planning/store";
import { cn } from "@/lib/cn";
import { PrototypeBanner } from "../layout/PrototypeBanner";
import { ThemeToggle } from "../layout/ThemeToggle";
import { DailyCrewPlanningView } from "./planning/DailyCrewPlanningView";
import { CrewDaySheetView } from "./day-sheet/CrewDaySheetView";

export function CrewPlanningShell() {
  const activeTab = useCrewPlanningStore((s) => s.activeTab);
  const setActiveTab = useCrewPlanningStore((s) => s.setActiveTab);

  return (
    <div className="flex h-screen flex-col bg-[var(--background)] text-[var(--foreground)]">
      <PrototypeBanner />
      <header className="flex items-center justify-between border-b border-[var(--border-subtle)] px-4 py-2.5">
        <div className="flex items-center gap-3">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[var(--foreground)] text-xs font-bold text-[var(--background)]">
            T
          </span>
          <div className="flex items-center gap-1 rounded-md border border-[var(--border)] p-0.5">
            <button
              onClick={() => setActiveTab("planning")}
              className={cn(
                "rounded px-3 py-1.5 text-xs font-medium transition-colors",
                activeTab === "planning"
                  ? "bg-[var(--foreground)] text-[var(--background)]"
                  : "text-[var(--muted)] hover:text-[var(--foreground)]"
              )}
            >
              Daily Crew Planning
            </button>
            <button
              onClick={() => setActiveTab("day-sheet")}
              className={cn(
                "rounded px-3 py-1.5 text-xs font-medium transition-colors",
                activeTab === "day-sheet"
                  ? "bg-[var(--foreground)] text-[var(--background)]"
                  : "text-[var(--muted)] hover:text-[var(--foreground)]"
              )}
            >
              Crew Day Sheet
            </button>
          </div>
        </div>
        <ThemeToggle />
      </header>

      {activeTab === "planning" ? <DailyCrewPlanningView /> : <CrewDaySheetView />}
    </div>
  );
}
