"use client";

import { useState } from "react";
import { useCrewPlanningStore } from "@/lib/crew-planning/store";
import type { ServiceType } from "@/lib/crew-planning/types";
import { JobQueueCard } from "./JobQueueCard";
import { SearchIcon } from "../../ui/Icons";

const SERVICE_TYPES: ServiceType[] = [
  "Deep Cleaning",
  "Commercial Cleaning",
  "Standard Cleaning",
  "Recurring Home Cleaning",
  "Move-out Cleaning",
  "Post-construction",
];

export function UnplannedJobsPanel() {
  const jobs = useCrewPlanningStore((s) => s.jobs);
  const aiPlan = useCrewPlanningStore((s) => s.aiPlan);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "overdue" | "proposed">("all");
  const [serviceFilter, setServiceFilter] = useState<"all" | ServiceType>("all");

  const unplanned = jobs.filter((j) => j.status === "unassigned");

  const proposalByJobId = new Map((aiPlan?.recommendations ?? []).filter((r) => r.jobId).map((r) => [r.jobId!, r]));

  const filtered = unplanned.filter((j) => {
    const q = search.trim().toLowerCase();
    if (q && !`${j.customerName} ${j.address}`.toLowerCase().includes(q)) return false;
    if (serviceFilter !== "all" && j.serviceType !== serviceFilter) return false;
    if (statusFilter === "overdue" && !j.overdue) return false;
    if (statusFilter === "proposed" && !proposalByJobId.has(j.id)) return false;
    return true;
  });

  return (
    <aside className="flex w-[280px] shrink-0 flex-col border-r border-[var(--border-subtle)] bg-[var(--surface)]">
      <div className="flex items-center justify-between px-3 pt-3">
        <h2 className="text-xs font-semibold text-[var(--foreground)]">Unplanned Jobs</h2>
        <span className="rounded-full bg-black/[0.06] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--muted)] dark:bg-white/10">
          {unplanned.length}
        </span>
      </div>
      <p className="px-3 pt-0.5 text-[10px] uppercase tracking-wide text-[var(--muted-2)]">Imported from Jobber</p>

      <div className="flex flex-col gap-2 p-3">
        <div className="relative">
          <SearchIcon size={13} className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customer or address"
            className="w-full rounded-md border border-[var(--border)] bg-[var(--surface)] py-1.5 pl-7 pr-2 text-xs outline-none focus:border-[var(--muted-2)]"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            className="flex-1 rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1.5 text-[11px]"
          >
            <option value="all">Status: All</option>
            <option value="overdue">Overdue</option>
            <option value="proposed">In AI proposal</option>
          </select>
          <select
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value as typeof serviceFilter)}
            className="flex-1 rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1.5 text-[11px]"
          >
            <option value="all">Service: All</option>
            {SERVICE_TYPES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-3">
        <div className="flex flex-col gap-2">
          {filtered.map((job) => (
            <JobQueueCard key={job.id} job={job} proposal={proposalByJobId.get(job.id)} />
          ))}
          {filtered.length === 0 && (
            <p className="py-6 text-center text-[11px] text-[var(--muted-2)]">No unplanned jobs match.</p>
          )}
        </div>
      </div>
    </aside>
  );
}
