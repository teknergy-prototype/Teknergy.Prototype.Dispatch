"use client";

import { useDispatchStore } from "@/lib/store";
import { cn } from "@/lib/cn";
import { CrewPanel } from "./CrewPanel";
import { EquipPanel } from "./EquipPanel";
import { ProjectsPanel } from "./ProjectsPanel";
import { SearchIcon } from "../ui/Icons";

const TABS_BY_VIEW: Record<string, { key: string; label: string }[]> = {
  schedule: [
    { key: "projects", label: "Projects" },
    { key: "crew", label: "Crew" },
    { key: "equip", label: "Equip" },
  ],
  routes: [
    { key: "projects", label: "Projects" },
    { key: "crew", label: "Crew" },
  ],
  availability: [{ key: "crew", label: "Crew" }],
};

export function Sidebar() {
  const activeView = useDispatchStore((s) => s.activeView);
  const sidebarTab = useDispatchStore((s) => s.sidebarTab);
  const setSidebarTab = useDispatchStore((s) => s.setSidebarTab);
  const sidebarSearch = useDispatchStore((s) => s.sidebarSearch);
  const setSidebarSearch = useDispatchStore((s) => s.setSidebarSearch);

  const tabs = TABS_BY_VIEW[activeView];
  const currentTab = tabs.find((t) => t.key === sidebarTab[activeView])?.key ?? tabs[0].key;

  return (
    <aside className="flex w-[280px] shrink-0 flex-col border-r border-[var(--border-subtle)] bg-[var(--surface)]">
      {tabs.length > 1 && (
        <div className="flex border-b border-[var(--border-subtle)] px-2 pt-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setSidebarTab(activeView, tab.key)}
              className={cn(
                "flex-1 border-b-2 px-2 py-2 text-xs font-medium transition-colors",
                currentTab === tab.key
                  ? "border-[var(--foreground)] text-[var(--foreground)]"
                  : "border-transparent text-[var(--muted)] hover:text-[var(--foreground)]"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      <div className="border-b border-[var(--border-subtle)] p-2">
        <div className="relative">
          <SearchIcon
            size={13}
            className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-[var(--muted)]"
          />
          <input
            value={sidebarSearch}
            onChange={(e) => setSidebarSearch(e.target.value)}
            placeholder="Search…"
            className="w-full rounded-md border border-[var(--border)] bg-[var(--surface)] py-1.5 pl-7 pr-2 text-xs outline-none focus:border-[var(--muted-2)]"
          />
        </div>
      </div>

      {activeView !== "availability" && currentTab === "projects" && (
        <ProjectsPanel view={activeView as "schedule" | "routes"} />
      )}
      {currentTab === "crew" && <CrewPanel />}
      {activeView === "schedule" && currentTab === "equip" && <EquipPanel />}
    </aside>
  );
}
