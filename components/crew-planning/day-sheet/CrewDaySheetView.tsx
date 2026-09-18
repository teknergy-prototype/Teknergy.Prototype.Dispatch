"use client";

import { useState } from "react";
import { buildDayItinerary, summarizeItinerary } from "@/lib/crew-planning/itinerary";
import { useCrewPlanningStore } from "@/lib/crew-planning/store";
import { formatDuration, formatMinutes } from "@/lib/crew-planning/time";
import { cn } from "@/lib/cn";
import { Badge } from "../../ui/Badge";
import { Button } from "../../ui/Button";
import { ChevronLeftIcon, ChevronRightIcon, MailIcon, PrinterIcon } from "../../ui/Icons";
import { DayItinerary } from "./DayItinerary";
import { CrewDetailsPanel } from "./CrewDetailsPanel";
import { CustomerAccessPanel } from "./CustomerAccessPanel";
import { DayNotesPanel } from "./DayNotesPanel";
import { AcknowledgmentPanel } from "./AcknowledgmentPanel";

export function CrewDaySheetView() {
  const dateLabel = useCrewPlanningStore((s) => s.dateLabel);
  const crews = useCrewPlanningStore((s) => s.crews);
  const teamMembers = useCrewPlanningStore((s) => s.teamMembers);
  const jobs = useCrewPlanningStore((s) => s.jobs);
  const daySheetMode = useCrewPlanningStore((s) => s.daySheetMode);
  const setDaySheetMode = useCrewPlanningStore((s) => s.setDaySheetMode);
  const selectedCrewId = useCrewPlanningStore((s) => s.selectedCrewId);
  const setSelectedCrewId = useCrewPlanningStore((s) => s.setSelectedCrewId);
  const selectedMemberId = useCrewPlanningStore((s) => s.selectedMemberId);
  const selectTeamMember = useCrewPlanningStore((s) => s.selectTeamMember);
  const selectedJobId = useCrewPlanningStore((s) => s.selectedJobId);
  const setSelectedJobId = useCrewPlanningStore((s) => s.setSelectedJobId);
  const [emailSent, setEmailSent] = useState(false);

  const crew = crews.find((c) => c.id === selectedCrewId) ?? crews[0];
  const itinerary = buildDayItinerary(crew, jobs);
  const summary = summarizeItinerary(itinerary);
  const jobIdsInItinerary = itinerary.filter((i) => i.jobId).map((i) => i.jobId!);
  const effectiveSelectedJobId = jobIdsInItinerary.includes(selectedJobId ?? "") ? selectedJobId! : jobIdsInItinerary[0];

  const member = selectedMemberId ? teamMembers.find((m) => m.id === selectedMemberId) : undefined;
  const title = daySheetMode === "byMember" && member ? `${member.name.split(" ")[0]}’s Day Sheet` : "Crew Day Sheet";
  const emailLabel =
    daySheetMode === "byMember" && member ? `Email ${member.name.split(" ")[0]}` : "Email crew day sheet";

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <div className="border-b border-[var(--border-subtle)] px-4 py-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold text-[var(--foreground)]">{title}</h1>
              <Badge className="bg-black/[0.06] text-[var(--foreground)] dark:bg-white/10">V3 · PUBLISHED</Badge>
            </div>
            <p className="text-xs text-[var(--muted)]">{dateLabel} · Appointments synced from Jobber</p>
          </div>
          <div className="flex items-center gap-2 print:hidden">
            <Button variant="secondary" className="text-xs" onClick={() => window.print()}>
              <PrinterIcon size={13} /> Print
            </Button>
            <Button
              variant="secondary"
              className="text-xs"
              onClick={() => {
                setEmailSent(true);
                setTimeout(() => setEmailSent(false), 2000);
              }}
            >
              <MailIcon size={13} /> {emailSent ? "Sent ✓" : emailLabel}
            </Button>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2 print:hidden">
          <div className="flex items-center gap-1 rounded-md border border-[var(--border)] px-2 py-1.5">
            <button className="text-[var(--muted-2)] disabled:opacity-40" disabled aria-label="Previous day">
              <ChevronLeftIcon size={14} />
            </button>
            <span className="px-1 text-xs font-medium text-[var(--foreground)]">{dateLabel.split(",")[0]}, Sep 22</span>
            <button className="text-[var(--muted-2)] disabled:opacity-40" disabled aria-label="Next day">
              <ChevronRightIcon size={14} />
            </button>
          </div>

          <div className="flex items-center gap-0.5 rounded-md border border-[var(--border)] p-0.5">
            <button
              onClick={() => setDaySheetMode("byCrew")}
              className={cn(
                "rounded px-2.5 py-1 text-xs font-medium transition-colors",
                daySheetMode === "byCrew" ? "bg-[var(--foreground)] text-[var(--background)]" : "text-[var(--muted)]"
              )}
            >
              By Crew
            </button>
            <button
              onClick={() => {
                setDaySheetMode("byMember");
                if (!selectedMemberId) selectTeamMember(crew.memberIds[0]);
              }}
              className={cn(
                "rounded px-2.5 py-1 text-xs font-medium transition-colors",
                daySheetMode === "byMember" ? "bg-[var(--foreground)] text-[var(--background)]" : "text-[var(--muted)]"
              )}
            >
              By Team Member
            </button>
          </div>

          {daySheetMode === "byCrew" ? (
            <select
              value={selectedCrewId}
              onChange={(e) => setSelectedCrewId(e.target.value)}
              className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1.5 text-xs font-medium"
            >
              {crews.map((c) => {
                const names = c.memberIds.map((id) => teamMembers.find((m) => m.id === id)?.name).join(" + ");
                return (
                  <option key={c.id} value={c.id}>
                    {c.name} · {names}
                  </option>
                );
              })}
            </select>
          ) : (
            <select
              value={selectedMemberId ?? ""}
              onChange={(e) => selectTeamMember(e.target.value)}
              className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1.5 text-xs font-medium"
            >
              {crews.flatMap((c) =>
                c.memberIds.map((id) => {
                  const m = teamMembers.find((tm) => tm.id === id);
                  return (
                    <option key={id} value={id}>
                      {m?.name} — {c.name}
                    </option>
                  );
                })
              )}
            </select>
          )}
        </div>
      </div>

      <div className="grid grid-cols-7 gap-3 border-b border-[var(--border-subtle)] px-4 py-2.5 text-xs">
        <SummaryStat label="Start time" value={formatMinutes(summary.startMinutes)} />
        <SummaryStat label="Estimated end" value={formatMinutes(summary.endMinutes)} />
        <SummaryStat label="Jobs" value={String(summary.jobCount)} />
        <SummaryStat label="Service time" value={formatDuration(summary.serviceMinutes)} />
        <SummaryStat label="Travel time" value={formatDuration(summary.travelMinutes)} />
        <SummaryStat label="Breaks & lunch" value={formatDuration(summary.breakMinutes)} />
        <SummaryStat label="Estimated miles" value={`${summary.miles} mi`} />
      </div>
      <div className="flex items-center gap-1.5 border-b border-[var(--border-subtle)] px-4 py-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400">Schedule confirmed</span>
      </div>

      <div className="grid flex-1 grid-cols-1 gap-4 p-4 lg:grid-cols-[1fr_320px]">
        <DayItinerary
          items={itinerary}
          jobs={jobs}
          teamLabel={crew.memberIds.map((id) => teamMembers.find((m) => m.id === id)?.name).join(" + ")}
          selectedJobId={effectiveSelectedJobId}
          onSelectJob={setSelectedJobId}
        />
        <div className="flex flex-col gap-4">
          <CrewDetailsPanel crew={crew} />
          <CustomerAccessPanel jobId={effectiveSelectedJobId} />
          <DayNotesPanel crewId={crew.id} />
          <AcknowledgmentPanel crew={crew} />
        </div>
      </div>

      <div className="border-t border-[var(--border-subtle)] px-4 py-3 text-center text-[10px] text-[var(--muted-2)]">
        This day sheet is generated from the approved schedule. Changes after publishing require a new version.
      </div>
    </div>
  );
}

function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[9px] uppercase tracking-wide text-[var(--muted-2)]">{label}</div>
      <div className="text-xs font-semibold text-[var(--foreground)]">{value}</div>
    </div>
  );
}
