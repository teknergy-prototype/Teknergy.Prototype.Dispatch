"use client";

import { useDispatchStore } from "@/lib/store";
import { EmployeeQueueCard } from "./EmployeeQueueCard";

export function CrewPanel() {
  const employees = useDispatchStore((s) => s.employees);
  const sidebarSearch = useDispatchStore((s) => s.sidebarSearch);

  const filtered = employees.filter((e) =>
    e.name.toLowerCase().includes(sidebarSearch.trim().toLowerCase())
  );

  return (
    <div className="flex-1 overflow-y-auto p-2">
      <div className="flex flex-col gap-2">
        {filtered.map((employee) => (
          <EmployeeQueueCard key={employee.id} employee={employee} />
        ))}
        {filtered.length === 0 && (
          <div className="px-3 py-4 text-center text-[11px] text-[var(--muted-2)]">
            No crew members
          </div>
        )}
      </div>
    </div>
  );
}
