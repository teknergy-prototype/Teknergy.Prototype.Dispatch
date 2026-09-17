"use client";

import { useState } from "react";
import { useDispatchStore } from "@/lib/store";
import { Button } from "../ui/Button";
import { MultiSelect } from "../ui/MultiSelect";
import { FilterIcon, SearchIcon } from "../ui/Icons";

const PROJECT_STATUSES = [
  "Open",
  "In Progress",
  "Scheduled",
  "Change of Order",
  "Approved",
  "Completed",
  "On Hold",
];

const ROUTE_STATUSES = ["Pending", "In Progress", "Completed"];

export function FilterBar() {
  const activeView = useDispatchStore((s) => s.activeView);
  const [open, setOpen] = useState(true);

  const filters = useDispatchStore((s) => s.filters);
  const setFilters = useDispatchStore((s) => s.setFilters);
  const clearFilters = useDispatchStore((s) => s.clearFilters);
  const serviceCategories = useDispatchStore((s) => s.serviceCategories);

  const routesFilters = useDispatchStore((s) => s.routesFilters);
  const setRoutesFilters = useDispatchStore((s) => s.setRoutesFilters);

  if (activeView === "availability") return null;

  const isSchedule = activeView === "schedule" || activeView === "workload";
  const activeCount = isSchedule
    ? filters.statuses.length + filters.categories.length + (filters.search ? 1 : 0)
    : routesFilters.statuses.length + (routesFilters.search ? 1 : 0);

  return (
    <div className="border-b border-[var(--border-subtle)] px-4 py-2">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-1.5 rounded-md border border-[var(--border)] px-2.5 py-1.5 text-xs font-medium hover:bg-[var(--surface-hover)]"
        >
          <FilterIcon size={13} />
          Filters
          {activeCount > 0 && (
            <span className="rounded-full bg-[var(--foreground)] px-1.5 text-[10px] font-semibold text-[var(--background)]">
              {activeCount}
            </span>
          )}
        </button>
      </div>

      {open && (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {isSchedule ? (
            <>
              <MultiSelect
                label="Status"
                options={PROJECT_STATUSES.map((s) => ({ value: s, label: s }))}
                selected={filters.statuses}
                onChange={(v) => setFilters({ statuses: v })}
              />
              <MultiSelect
                label="Service category"
                options={serviceCategories.map((c) => ({ value: c.id, label: c.name }))}
                selected={filters.categories}
                onChange={(v) => setFilters({ categories: v })}
              />
              <div className="relative">
                <SearchIcon
                  size={13}
                  className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-[var(--muted)]"
                />
                <input
                  value={filters.search}
                  onChange={(e) => setFilters({ search: e.target.value })}
                  placeholder="Search project, address, crew…"
                  className="w-56 rounded-md border border-[var(--border)] bg-[var(--surface)] py-1.5 pl-7 pr-2 text-xs outline-none focus:border-[var(--muted-2)]"
                />
              </div>
              {activeCount > 0 && (
                <Button variant="ghost" className="text-xs" onClick={clearFilters}>
                  Clear filters
                </Button>
              )}
            </>
          ) : (
            <>
              <MultiSelect
                label="Route status"
                options={ROUTE_STATUSES.map((s) => ({ value: s, label: s }))}
                selected={routesFilters.statuses}
                onChange={(v) => setRoutesFilters({ statuses: v })}
              />
              <div className="relative">
                <SearchIcon
                  size={13}
                  className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-[var(--muted)]"
                />
                <input
                  value={routesFilters.search}
                  onChange={(e) => setRoutesFilters({ search: e.target.value })}
                  placeholder="Search project, address, crew…"
                  className="w-56 rounded-md border border-[var(--border)] bg-[var(--surface)] py-1.5 pl-7 pr-2 text-xs outline-none focus:border-[var(--muted-2)]"
                />
              </div>
              {activeCount > 0 && (
                <Button
                  variant="ghost"
                  className="text-xs"
                  onClick={() => setRoutesFilters({ search: "", statuses: [] })}
                >
                  Clear filters
                </Button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
