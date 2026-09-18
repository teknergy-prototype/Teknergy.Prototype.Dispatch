"use client";

import { BREAK_POLICY_LABEL } from "@/lib/crew-planning/breakPolicy";
import { JOB_STATUS_STYLES } from "@/lib/crew-planning/colors";
import { formatDuration, formatMinutes } from "@/lib/crew-planning/time";
import type { ItineraryItem, Job } from "@/lib/crew-planning/types";
import { cn } from "@/lib/cn";
import { Badge } from "../../ui/Badge";
import { BoxIcon, ClipboardIcon, CoffeeIcon, HomeIcon, InfoIcon, TruckIcon, WarningIcon } from "../../ui/Icons";

const ICONS: Record<ItineraryItem["type"], typeof ClipboardIcon> = {
  checkin: ClipboardIcon,
  "load-equipment": BoxIcon,
  travel: TruckIcon,
  job: HomeIcon,
  break: CoffeeIcon,
  lunch: CoffeeIcon,
  "return-office": TruckIcon,
  "end-day": HomeIcon,
};

export function DayItinerary({
  items,
  jobs,
  teamLabel,
  selectedJobId,
  onSelectJob,
}: {
  items: ItineraryItem[];
  jobs: Job[];
  teamLabel: string;
  selectedJobId?: string;
  onSelectJob: (id: string) => void;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <h2 className="flex items-center gap-1 text-xs font-semibold text-[var(--foreground)]">
          Day itinerary
          <span className="font-normal normal-case tracking-normal text-[var(--muted-2)]">· simulated break policy</span>
          <span title={BREAK_POLICY_LABEL} className="cursor-help font-normal text-[var(--muted-2)]">
            <InfoIcon size={11} />
          </span>
        </h2>
        <span className="text-[10px] text-[var(--muted-2)]">Select a job to see access details →</span>
      </div>

      <div className="flex flex-col">
        {items.map((item, i) => {
          const Icon = ICONS[item.type];
          const job = item.jobId ? jobs.find((j) => j.id === item.jobId) : undefined;
          const isJob = item.type === "job";
          const isBreakLike = item.type === "break" || item.type === "lunch";
          const isSelected = isJob && item.jobId === selectedJobId;

          return (
            <div key={item.id} className="flex gap-3">
              <div className="flex w-16 shrink-0 flex-col items-end pt-2 text-right">
                <span className="text-[10px] font-medium text-[var(--foreground)]">{formatMinutes(item.startMinutes)}</span>
                <span className="text-[9px] text-[var(--muted-2)]">{formatDuration(item.endMinutes - item.startMinutes)}</span>
              </div>
              <div className="flex flex-col items-center pt-2.5">
                <span
                  className={cn(
                    "flex h-4 w-4 items-center justify-center rounded-full border-2",
                    isJob ? "border-[var(--foreground)]" : "border-[var(--border)] bg-[var(--surface)]"
                  )}
                >
                  {isJob && <span className="h-1.5 w-1.5 rounded-full bg-[var(--foreground)]" />}
                </span>
                {i < items.length - 1 && <span className="w-px flex-1 bg-[var(--border-subtle)]" />}
              </div>

              <div className="mb-2.5 flex-1 pb-0.5">
                {isJob && job ? (
                  <button
                    onClick={() => onSelectJob(job.id)}
                    className={cn(
                      "flex w-full flex-col gap-2 rounded-md border p-3 text-left shadow-sm",
                      isSelected ? "border-[var(--foreground)] ring-1 ring-[var(--foreground)]" : "border-[var(--border-subtle)]"
                    )}
                    style={{ borderLeftWidth: 3, borderLeftColor: JOB_STATUS_STYLES[job.status].border }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-[var(--foreground)]">
                        <Icon size={13} /> Job #{job.id} · {job.serviceType}
                      </span>
                      <Badge bg={JOB_STATUS_STYLES[job.status].bg} text={JOB_STATUS_STYLES[job.status].text}>
                        {JOB_STATUS_STYLES[job.status].label}
                      </Badge>
                    </div>
                    <div className="text-[11px] text-[var(--muted)]">{job.customerName}</div>
                    <div className="grid grid-cols-3 gap-2 border-t border-[var(--border-subtle)] pt-2 text-[10px]">
                      <div>
                        <div className="uppercase tracking-wide text-[var(--muted-2)]">Customer</div>
                        <div className="text-[var(--foreground)]">{job.customerName}</div>
                      </div>
                      <div>
                        <div className="uppercase tracking-wide text-[var(--muted-2)]">Address</div>
                        <div className="text-[var(--foreground)]">{job.address}</div>
                      </div>
                      <div>
                        <div className="uppercase tracking-wide text-[var(--muted-2)]">Team</div>
                        <div className="text-[var(--foreground)]">{teamLabel}</div>
                      </div>
                    </div>
                    {job.accessNote && (
                      <Badge className="w-fit bg-black/[0.05] text-[var(--foreground)] dark:bg-white/10">
                        {job.accessNote}
                      </Badge>
                    )}
                  </button>
                ) : (
                  <div
                    className={cn(
                      "flex items-center justify-between gap-2 rounded-md border px-3 py-2 text-[11px]",
                      isBreakLike
                        ? "border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-950/20"
                        : "border-[var(--border-subtle)] bg-[var(--surface)]"
                    )}
                  >
                    <span className="flex items-center gap-1.5 font-medium text-[var(--foreground)]">
                      <Icon size={13} /> {item.label}
                      {item.detail && <span className="font-normal text-[var(--muted)]">· {item.detail}</span>}
                    </span>
                    {item.miles != null && <span className="text-[var(--muted-2)]">{item.miles} mi</span>}
                  </div>
                )}

                {item.warning && (
                  <div className="mt-1.5 flex items-center gap-1.5 rounded-md bg-red-50 px-2.5 py-1.5 text-[10px] font-medium text-red-700 dark:bg-red-950/30 dark:text-red-400">
                    <WarningIcon size={11} /> {item.warning}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
