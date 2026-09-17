"use client";

import { SECTION_COLORS } from "@/lib/colors";
import { matchesSearch, matchesStatusCategory } from "@/lib/filters";
import {
  buildQueueTree,
  getRoutesQueueSections,
  getScheduleQueueSections,
  groupByStatus,
} from "@/lib/queue";
import { useDispatchStore } from "@/lib/store";
import { CollapsibleSection } from "./CollapsibleSection";
import { ProjectQueueCard } from "./ProjectQueueCard";

function EmptyHint() {
  return (
    <div className="px-3 py-4 text-center text-[11px] text-[var(--muted-2)]">No projects</div>
  );
}

export function ProjectsPanel({ view }: { view: "schedule" | "routes" }) {
  const projects = useDispatchStore((s) => s.projects);
  const crewAssignments = useDispatchStore((s) => s.crewAssignments);
  const employees = useDispatchStore((s) => s.employees);
  const sidebarSearch = useDispatchStore((s) => s.sidebarSearch);
  const filters = useDispatchStore((s) => s.filters);

  const filtered = projects.filter((p) => {
    if (!matchesSearch(p, sidebarSearch, crewAssignments, employees)) return false;
    if (view === "schedule") return matchesStatusCategory(p, filters.statuses, filters.categories);
    return true;
  });

  const sections =
    view === "schedule" ? getScheduleQueueSections(filtered) : getRoutesQueueSections(filtered);
  const secondLabel = view === "schedule" ? "Overdue" : "Active Projects";
  const secondColors = view === "schedule" ? SECTION_COLORS.overdue : SECTION_COLORS.activeProjects;

  const noDateTree = buildQueueTree(sections.noDate);
  const secondTree = buildQueueTree(sections.secondSection);
  const buckets = groupByStatus(secondTree);

  return (
    <div className="flex-1 overflow-y-auto">
      <CollapsibleSection
        sectionKey="queue-no-date"
        title="No date"
        count={sections.noDate.length}
        textColor={SECTION_COLORS.noDate.text}
        bgColor={SECTION_COLORS.noDate.bg}
      >
        <div className="flex flex-col gap-2 p-2">
          {noDateTree.map((group) => (
            <div key={group.project.id} className="flex flex-col gap-2">
              <ProjectQueueCard project={group.project} />
              {group.children.map((child) => (
                <ProjectQueueCard key={child.id} project={child} indented />
              ))}
            </div>
          ))}
          {noDateTree.length === 0 && <EmptyHint />}
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        sectionKey="queue-second"
        title={secondLabel}
        count={sections.secondSection.length}
        textColor={secondColors.text}
        bgColor={secondColors.bg}
      >
        <div className="flex flex-col">
          {buckets.map((bucket) => (
            <CollapsibleSection
              key={bucket.status}
              sectionKey={`bucket-${view}-${bucket.status}`}
              title={bucket.status}
              count={bucket.groups.reduce((n, g) => n + 1 + g.children.length, 0)}
            >
              <div className="flex flex-col gap-2 p-2">
                {bucket.groups.map((group) => (
                  <div key={group.project.id} className="flex flex-col gap-2">
                    <ProjectQueueCard project={group.project} />
                    {group.children.map((child) => (
                      <ProjectQueueCard key={child.id} project={child} indented />
                    ))}
                  </div>
                ))}
              </div>
            </CollapsibleSection>
          ))}
          {buckets.length === 0 && <EmptyHint />}
        </div>
      </CollapsibleSection>
    </div>
  );
}
