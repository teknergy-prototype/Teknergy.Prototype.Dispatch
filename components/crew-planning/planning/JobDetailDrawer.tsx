"use client";

import { useState } from "react";
import { JOB_STATUS_STYLES } from "@/lib/crew-planning/colors";
import { useCrewPlanningStore } from "@/lib/crew-planning/store";
import { formatDuration, formatMinutes } from "@/lib/crew-planning/time";
import { Avatar } from "../../ui/Avatar";
import { Badge } from "../../ui/Badge";
import { Button } from "../../ui/Button";
import { LockIcon, PhoneIcon, XIcon } from "../../ui/Icons";
import { AssignJobModal } from "./AssignJobModal";

export function JobDetailDrawer() {
  const selectedJobId = useCrewPlanningStore((s) => s.selectedJobId);
  const setSelectedJobId = useCrewPlanningStore((s) => s.setSelectedJobId);
  const jobs = useCrewPlanningStore((s) => s.jobs);
  const crews = useCrewPlanningStore((s) => s.crews);
  const teamMembers = useCrewPlanningStore((s) => s.teamMembers);
  const setActiveTab = useCrewPlanningStore((s) => s.setActiveTab);
  const setSelectedCrewId = useCrewPlanningStore((s) => s.setSelectedCrewId);
  const [revealCode, setRevealCode] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);

  const job = jobs.find((j) => j.id === selectedJobId);
  if (!job) return null;

  const style = JOB_STATUS_STYLES[job.status];
  const crew = job.crewTeamId ? crews.find((c) => c.id === job.crewTeamId) : undefined;
  const crewMemberNames = crew?.memberIds.map((id) => teamMembers.find((m) => m.id === id)?.name).filter(Boolean) ?? [];

  return (
    <>
      <div className="border-t-2 border-[var(--foreground)] bg-[var(--surface)] p-4">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-[var(--muted-2)]">Selected Job</span>
          <span className="text-sm font-semibold text-[var(--foreground)]">{job.customerName}</span>
          <Badge bg={style.bg} text={style.text}>
            {style.label}
            {job.conflictNote ? ` · ${job.conflictNote.toUpperCase()}` : ""}
          </Badge>
          {job.jobberAppointmentId && (
            <span className="text-[10px] text-[var(--muted-2)]">Jobber appointment #{job.jobberAppointmentId}</span>
          )}
          <div className="ml-auto flex items-center gap-2">
            {crew && (
              <Button
                variant="secondary"
                className="text-[11px]"
                onClick={() => {
                  setSelectedCrewId(crew.id);
                  setActiveTab("day-sheet");
                }}
              >
                View crew day sheet
              </Button>
            )}
            <button
              onClick={() => setSelectedJobId(null)}
              className="rounded-md p-1 text-[var(--muted)] hover:bg-[var(--surface-hover)]"
              aria-label="Close"
            >
              <XIcon size={15} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs sm:grid-cols-3 lg:grid-cols-5">
          <div>
            <div className="text-[10px] uppercase tracking-wide text-[var(--muted-2)]">Customer</div>
            <div className="font-medium text-[var(--foreground)]">{job.customerName}</div>
            <div className="mt-1 text-[var(--muted)]">{job.address}</div>
            {job.phone && (
              <div className="mt-1 flex items-center gap-1 text-[var(--muted)]">
                <PhoneIcon size={11} /> {job.phone} {job.contactName ? `· ${job.contactName}` : ""}
              </div>
            )}
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wide text-[var(--muted-2)]">Service instructions</div>
            <div className="text-[var(--muted)]">{job.serviceInstructions ?? "—"}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wide text-[var(--muted-2)]">Access code</div>
            {job.accessCode ? (
              <div className="flex items-center gap-1.5">
                <LockIcon size={11} className="text-[var(--muted-2)]" />
                <span className="font-mono text-[var(--foreground)]">{revealCode ? job.accessCode : "••••"}</span>
                <button onClick={() => setRevealCode((r) => !r)} className="text-[10px] font-medium text-blue-600 hover:underline">
                  {revealCode ? "Hide" : "Reveal"}
                </button>
              </div>
            ) : (
              <div className="text-[var(--muted)]">{job.accessNote ?? "—"}</div>
            )}
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wide text-[var(--muted-2)]">Est. duration</div>
            <div className="font-medium text-[var(--foreground)]">{formatDuration(job.durationMinutes)}</div>
            {job.travelInMinutes != null && (
              <>
                <div className="mt-2 text-[10px] uppercase tracking-wide text-[var(--muted-2)]">Est. travel in</div>
                <div className="font-medium text-red-600">
                  {job.travelInMinutes} min · from {job.travelFromLabel}
                </div>
              </>
            )}
            {job.scheduledStartMinutes != null && (
              <>
                <div className="mt-2 text-[10px] uppercase tracking-wide text-[var(--muted-2)]">Scheduled (Jobber)</div>
                <div className="text-[var(--muted)]">
                  {formatMinutes(job.scheduledStartMinutes)} – {formatMinutes(job.scheduledEndMinutes!)}
                </div>
              </>
            )}
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wide text-[var(--muted-2)]">Assigned crew</div>
            {crew ? (
              <div className="flex items-center gap-1.5">
                <Avatar name={crew.name} color="#6d28d9" size={18} />
                <div>
                  <div className="font-medium text-[var(--foreground)]">{crew.name}</div>
                  <div className="text-[var(--muted)]">{crewMemberNames.join(", ")}</div>
                </div>
              </div>
            ) : (
              <Button variant="primary" className="mt-1 text-[11px]" onClick={() => setAssignOpen(true)}>
                Assign to a crew
              </Button>
            )}
            {job.status === "conflict" && (
              <div className="mt-2 flex flex-col gap-1">
                <div className="text-[10px] uppercase tracking-wide text-[var(--muted-2)]">Fix options</div>
                <button className="rounded-md border border-[var(--border)] px-2 py-1 text-left text-[10px] hover:bg-[var(--surface-hover)]">
                  Shorten prior stop by 20 min
                </button>
                <button className="rounded-md border border-[var(--border)] px-2 py-1 text-left text-[10px] hover:bg-[var(--surface-hover)]">
                  Notify client of late arrival
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      {assignOpen && <AssignJobModal jobId={job.id} onClose={() => setAssignOpen(false)} />}
    </>
  );
}
