import { create } from "zustand";
import type { DateRange } from "./dates";
import { getVisibleDays, today as todayISO } from "./dates";
import {
  AVAILABILITY_ENTRIES,
  CREW_ASSIGNMENTS,
  EMPLOYEES,
  EQUIPMENT,
  EQUIPMENT_ASSIGNMENTS,
  PROJECTS,
  ROUTE_STOPS,
  ROUTE_TYPES,
  SERVICE_CATEGORIES,
} from "./fixtures";
import { colorForId } from "./colors";
import { generateProposal as runGenerateProposal, parseInstruction } from "./ai/recommendation";
import type {
  AIConstraints,
  AvailabilityEntry,
  CrewAssignment,
  Employee,
  Equipment,
  EquipmentAssignment,
  EquipmentScope,
  ISODate,
  Project,
  Proposal,
  RouteStop,
  RouteTypeDef,
  ServiceCategory,
  ViewKey,
} from "./types";
import type { DragItemData } from "./dnd";

export type ModalState =
  | { type: "schedule-project"; projectId: string; day: ISODate }
  | { type: "assign-crew"; projectId: string; employeeId: string; day: ISODate }
  | {
      type: "assign-equipment";
      projectId: string;
      equipmentId: string;
      day: ISODate;
      employeeId?: string;
    }
  | { type: "locked-notice"; projectName: string }
  | { type: "dayoff-blocked"; employeeName: string; day: ISODate }
  | { type: "add-route-stop"; employeeId: string; day: ISODate; projectId?: string }
  | { type: "add-availability"; employeeId: string; day: ISODate }
  | { type: "project-detail"; projectId: string }
  | { type: "history"; projectId: string };

export interface ScheduleFilters {
  statuses: string[];
  categories: string[];
  search: string;
}

export interface RoutesFilters {
  search: string;
  statuses: string[];
}

interface DispatchStore {
  serviceCategories: ServiceCategory[];
  routeTypes: RouteTypeDef[];
  equipment: Equipment[];

  projects: Project[];
  employees: Employee[];
  crewAssignments: CrewAssignment[];
  equipmentAssignments: EquipmentAssignment[];
  routeStops: RouteStop[];
  availabilityEntries: AvailabilityEntry[];

  activeView: ViewKey;
  setActiveView: (v: ViewKey) => void;

  scheduleRoutesRange: DateRange;
  setScheduleRoutesRange: (r: DateRange) => void;
  availabilityAnchor: ISODate;
  setAvailabilityAnchor: (d: ISODate) => void;
  hideWeekends: boolean;
  toggleHideWeekends: () => void;

  filters: ScheduleFilters;
  setFilters: (f: Partial<ScheduleFilters>) => void;
  clearFilters: () => void;
  filtersOpen: boolean;
  setFiltersOpen: (b: boolean) => void;

  routesFilters: RoutesFilters;
  setRoutesFilters: (f: Partial<RoutesFilters>) => void;
  routesFiltersOpen: boolean;
  setRoutesFiltersOpen: (b: boolean) => void;

  sidebarTab: Record<ViewKey, string>;
  setSidebarTab: (view: ViewKey, tab: string) => void;
  sidebarSearch: string;
  setSidebarSearch: (s: string) => void;
  collapsedSections: Set<string>;
  toggleSection: (key: string) => void;

  activeModal: ModalState | null;
  openModal: (m: ModalState) => void;
  closeModal: () => void;

  draggingItem: DragItemData | null;
  setDraggingItem: (d: DragItemData | null) => void;

  scheduleProject: (projectId: string, day: ISODate, mode: "add" | "reschedule") => void;
  removeWorkDay: (projectId: string, day: ISODate) => void;
  extendDay: (projectId: string) => void;
  assignCrew: (projectId: string, employeeId: string, day: ISODate) => void;
  removeCrew: (projectId: string, employeeId: string, day: ISODate) => void;
  assignEquipment: (
    equipmentId: string,
    scope: EquipmentScope,
    projectId: string,
    employeeId?: string,
    day?: ISODate
  ) => void;
  removeEquipmentAssignment: (id: string) => void;
  addRouteStop: (employeeId: string, projectId: string, day: ISODate, routeTypeId: string) => void;
  removeRouteStop: (id: string) => void;
  moveRouteStop: (id: string, direction: 1 | -1) => void;
  reorderRouteStops: (employeeId: string, day: ISODate, activeId: string, overId: string) => void;
  addEmployee: (name: string) => void;
  addAvailabilityEntry: (entry: Omit<AvailabilityEntry, "id">) => void;
  removeAvailabilityEntry: (id: string) => void;

  proposal: Proposal | null;
  aiPanelOpen: boolean;
  openAiPanel: () => void;
  closeAiPanel: () => void;
  generateProposal: () => void;
  sendChatMessage: (text: string) => void;
  acceptChange: (id: string) => void;
  rejectChange: (id: string) => void;
  discardProposal: () => void;
  applyRecommendation: () => void;
  publishSchedule: () => void;
}

function recomputeSpan(workDays: ISODate[]): { beginDate: ISODate | null; endDate: ISODate | null } {
  if (workDays.length === 0) return { beginDate: null, endDate: null };
  const sorted = [...workDays].sort();
  return { beginDate: sorted[0], endDate: sorted[sorted.length - 1] };
}

let idCounter = 1000;
function nextId(prefix: string): string {
  idCounter += 1;
  return `${prefix}-${idCounter}`;
}

export const useDispatchStore = create<DispatchStore>((set) => ({
  serviceCategories: SERVICE_CATEGORIES,
  routeTypes: ROUTE_TYPES,
  equipment: EQUIPMENT,

  projects: PROJECTS,
  employees: EMPLOYEES,
  crewAssignments: CREW_ASSIGNMENTS,
  equipmentAssignments: EQUIPMENT_ASSIGNMENTS,
  routeStops: ROUTE_STOPS,
  availabilityEntries: AVAILABILITY_ENTRIES,

  activeView: "schedule",
  setActiveView: (v) => set({ activeView: v }),

  scheduleRoutesRange: { anchor: todayISO(), mode: "7day", customStart: null, customEnd: null },
  setScheduleRoutesRange: (r) => set({ scheduleRoutesRange: r }),
  availabilityAnchor: todayISO(),
  setAvailabilityAnchor: (d) => set({ availabilityAnchor: d }),
  hideWeekends: false,
  toggleHideWeekends: () => set((s) => ({ hideWeekends: !s.hideWeekends })),

  filters: { statuses: [], categories: [], search: "" },
  setFilters: (f) => set((s) => ({ filters: { ...s.filters, ...f } })),
  clearFilters: () => set({ filters: { statuses: [], categories: [], search: "" } }),
  filtersOpen: false,
  setFiltersOpen: (b) => set({ filtersOpen: b }),

  routesFilters: { search: "", statuses: [] },
  setRoutesFilters: (f) => set((s) => ({ routesFilters: { ...s.routesFilters, ...f } })),
  routesFiltersOpen: false,
  setRoutesFiltersOpen: (b) => set({ routesFiltersOpen: b }),

  sidebarTab: { schedule: "projects", routes: "projects", availability: "crew" },
  setSidebarTab: (view, tab) => set((s) => ({ sidebarTab: { ...s.sidebarTab, [view]: tab } })),
  sidebarSearch: "",
  setSidebarSearch: (s) => set({ sidebarSearch: s }),
  collapsedSections: new Set(),
  toggleSection: (key) =>
    set((s) => {
      const next = new Set(s.collapsedSections);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return { collapsedSections: next };
    }),

  activeModal: null,
  openModal: (m) => set({ activeModal: m }),
  closeModal: () => set({ activeModal: null }),

  draggingItem: null,
  setDraggingItem: (d) => set({ draggingItem: d }),

  scheduleProject: (projectId, day, mode) =>
    set((s) => ({
      projects: s.projects.map((p) => {
        if (p.id !== projectId) return p;
        const workDays =
          mode === "reschedule" ? [day] : Array.from(new Set([...p.workDays, day]));
        return { ...p, workDays, ...recomputeSpan(workDays) };
      }),
    })),

  removeWorkDay: (projectId, day) =>
    set((s) => ({
      projects: s.projects.map((p) => {
        if (p.id !== projectId) return p;
        const workDays = p.workDays.filter((d) => d !== day);
        return { ...p, workDays, ...recomputeSpan(workDays) };
      }),
      crewAssignments: s.crewAssignments.filter(
        (a) => !(a.projectId === projectId && a.day === day)
      ),
      equipmentAssignments: s.equipmentAssignments.filter(
        (a) => !(a.projectId === projectId && a.day === day)
      ),
    })),

  extendDay: (projectId) =>
    set((s) => ({
      projects: s.projects.map((p) => {
        if (p.id !== projectId) return p;
        if (!p.endDate) return p;
        const next = new Date(p.endDate);
        next.setDate(next.getDate() + 1);
        const iso = next.toISOString().slice(0, 10);
        const workDays = Array.from(new Set([...p.workDays, iso]));
        return { ...p, workDays, ...recomputeSpan(workDays) };
      }),
    })),

  assignCrew: (projectId, employeeId, day) =>
    set((s) => {
      const exists = s.crewAssignments.some(
        (a) => a.projectId === projectId && a.employeeId === employeeId && a.day === day
      );
      if (exists) return s;
      return { crewAssignments: [...s.crewAssignments, { projectId, employeeId, day }] };
    }),

  removeCrew: (projectId, employeeId, day) =>
    set((s) => ({
      crewAssignments: s.crewAssignments.filter(
        (a) => !(a.projectId === projectId && a.employeeId === employeeId && a.day === day)
      ),
    })),

  assignEquipment: (equipmentId, scope, projectId, employeeId, day) =>
    set((s) => ({
      equipmentAssignments: [
        ...s.equipmentAssignments,
        {
          id: nextId("ea"),
          equipmentId,
          scope,
          projectId,
          employeeId: scope === "project" ? undefined : employeeId,
          day: scope === "member-whole-project" ? undefined : day,
        },
      ],
    })),

  removeEquipmentAssignment: (id) =>
    set((s) => ({
      equipmentAssignments: s.equipmentAssignments.filter((a) => a.id !== id),
    })),

  addRouteStop: (employeeId, projectId, day, routeTypeId) =>
    set((s) => {
      const stopsForCell = s.routeStops.filter((r) => r.employeeId === employeeId && r.day === day);
      const nextStopNumber = stopsForCell.length + 1;
      return {
        routeStops: [
          ...s.routeStops,
          {
            id: nextId("rs"),
            employeeId,
            projectId,
            day,
            stopNumber: nextStopNumber,
            routeTypeId,
            routeStatus: "Pending",
          },
        ],
      };
    }),

  removeRouteStop: (id) =>
    set((s) => {
      const target = s.routeStops.find((r) => r.id === id);
      if (!target) return s;
      const remaining = s.routeStops.filter((r) => r.id !== id);
      const renumbered = renumberCell(remaining, target.employeeId, target.day);
      return { routeStops: renumbered };
    }),

  moveRouteStop: (id, direction) =>
    set((s) => {
      const target = s.routeStops.find((r) => r.id === id);
      if (!target) return s;
      const cell = s.routeStops
        .filter((r) => r.employeeId === target.employeeId && r.day === target.day)
        .sort((a, b) => a.stopNumber - b.stopNumber);
      const idx = cell.findIndex((r) => r.id === id);
      const swapIdx = idx + direction;
      if (swapIdx < 0 || swapIdx >= cell.length) return s;
      const a = cell[idx];
      const b = cell[swapIdx];
      return {
        routeStops: s.routeStops.map((r) => {
          if (r.id === a.id) return { ...r, stopNumber: b.stopNumber };
          if (r.id === b.id) return { ...r, stopNumber: a.stopNumber };
          return r;
        }),
      };
    }),

  reorderRouteStops: (employeeId, day, activeId, overId) =>
    set((s) => {
      const cell = s.routeStops
        .filter((r) => r.employeeId === employeeId && r.day === day)
        .sort((a, b) => a.stopNumber - b.stopNumber);
      const fromIdx = cell.findIndex((r) => r.id === activeId);
      const toIdx = cell.findIndex((r) => r.id === overId);
      if (fromIdx === -1 || toIdx === -1 || fromIdx === toIdx) return s;
      const reordered = [...cell];
      const [moved] = reordered.splice(fromIdx, 1);
      reordered.splice(toIdx, 0, moved);
      const idToNumber = new Map(reordered.map((r, i) => [r.id, i + 1]));
      return {
        routeStops: s.routeStops.map((r) =>
          idToNumber.has(r.id) ? { ...r, stopNumber: idToNumber.get(r.id)! } : r
        ),
      };
    }),

  addEmployee: (name) =>
    set((s) => {
      const id = nextId("emp");
      return {
        employees: [...s.employees, { id, name, avatarColor: colorForId(id) }],
      };
    }),

  addAvailabilityEntry: (entry) =>
    set((s) => ({
      availabilityEntries: [...s.availabilityEntries, { ...entry, id: nextId("av") }],
    })),

  removeAvailabilityEntry: (id) =>
    set((s) => ({
      availabilityEntries: s.availabilityEntries.filter((e) => e.id !== id),
    })),

  proposal: null,
  aiPanelOpen: false,
  openAiPanel: () => set({ aiPanelOpen: true }),
  closeAiPanel: () => set({ aiPanelOpen: false }),

  generateProposal: () =>
    set((s) => {
      const days = getVisibleDays(s.scheduleRoutesRange);
      const constraints: AIConstraints = {
        prioritizeOverdue: false,
        avoidOvertime: false,
        excludedCrewDay: [],
        pinnedGroups: [],
      };
      const { changes, summary } = runGenerateProposal({
        days,
        projects: s.projects,
        employees: s.employees,
        crewAssignments: s.crewAssignments,
        availabilityEntries: s.availabilityEntries,
        constraints,
      });
      const intro =
        `Evaluated ${summary.evaluated} Projects in this range — ${summary.assigned} assigned, ` +
        `${summary.unassigned} unassigned, ${summary.conflictsResolved} conflict${summary.conflictsResolved === 1 ? "" : "s"} resolved.`;
      const proposal: Proposal = {
        scopeDays: days,
        summary,
        changes,
        chat: [{ id: nextId("msg"), role: "ai", text: intro }],
        constraints,
        status: "draft",
        iteration: 1,
      };
      return { proposal, aiPanelOpen: true };
    }),

  sendChatMessage: (text) =>
    set((s) => {
      if (!s.proposal) return s;
      const userMsg = { id: nextId("msg"), role: "user" as const, text };
      const parsed = parseInstruction(text, s.employees, s.proposal.scopeDays, s.projects);

      if (!parsed.recognized) {
        const aiMsg = {
          id: nextId("msg"),
          role: "ai" as const,
          text: "I couldn't tell which crew, day, or priority to adjust from that — try mentioning a crew name with a day, \"avoid overtime\", \"prioritize overdue\", or \"same crew\".",
        };
        return { proposal: { ...s.proposal, chat: [...s.proposal.chat, userMsg, aiMsg] } };
      }

      const nextConstraints: AIConstraints = {
        ...s.proposal.constraints,
        ...(parsed.updates.prioritizeOverdue !== undefined && { prioritizeOverdue: parsed.updates.prioritizeOverdue }),
        ...(parsed.updates.avoidOvertime !== undefined && { avoidOvertime: parsed.updates.avoidOvertime }),
        excludedCrewDay: parsed.updates.excludedCrewDay
          ? [...s.proposal.constraints.excludedCrewDay, ...parsed.updates.excludedCrewDay]
          : s.proposal.constraints.excludedCrewDay,
        pinnedGroups: parsed.updates.pinnedGroups
          ? Array.from(new Set([...s.proposal.constraints.pinnedGroups, ...parsed.updates.pinnedGroups]))
          : s.proposal.constraints.pinnedGroups,
      };

      const { changes, summary } = runGenerateProposal({
        days: s.proposal.scopeDays,
        projects: s.projects,
        employees: s.employees,
        crewAssignments: s.crewAssignments,
        availabilityEntries: s.availabilityEntries,
        constraints: nextConstraints,
      });

      const aiMsg = { id: nextId("msg"), role: "ai" as const, text: `I ${parsed.ackFragments.join(" and ")}.` };

      return {
        proposal: {
          ...s.proposal,
          constraints: nextConstraints,
          changes,
          summary,
          iteration: s.proposal.iteration + 1,
          chat: [...s.proposal.chat, userMsg, aiMsg],
        },
      };
    }),

  acceptChange: (id) =>
    set((s) => {
      if (!s.proposal) return s;
      return {
        proposal: {
          ...s.proposal,
          changes: s.proposal.changes.map((c) => (c.id === id ? { ...c, status: "accepted" } : c)),
        },
      };
    }),

  rejectChange: (id) =>
    set((s) => {
      if (!s.proposal) return s;
      return {
        proposal: {
          ...s.proposal,
          changes: s.proposal.changes.map((c) => (c.id === id ? { ...c, status: "rejected" } : c)),
        },
      };
    }),

  discardProposal: () => set({ proposal: null, aiPanelOpen: false }),

  applyRecommendation: () =>
    set((s) => {
      if (!s.proposal) return s;
      const accepted = s.proposal.changes.filter((c) => c.status === "accepted" && c.type !== "unassigned");

      let projects = s.projects;
      let crewAssignments = s.crewAssignments;

      for (const c of accepted) {
        if (c.proposedDay && c.proposedDay !== c.previousDay) {
          projects = projects.map((p) => {
            if (p.id !== c.projectId) return p;
            const withoutOld = c.previousDay ? p.workDays.filter((d) => d !== c.previousDay) : p.workDays;
            const workDays = Array.from(new Set([...withoutOld, c.proposedDay!]));
            return { ...p, workDays, ...recomputeSpan(workDays) };
          });
        }
        if (c.proposedDay) {
          const dayToClear = c.previousDay ?? c.proposedDay;
          crewAssignments = crewAssignments.filter(
            (a) => !(a.projectId === c.projectId && a.day === dayToClear)
          );
          for (const employeeId of c.proposedCrewIds) {
            crewAssignments = [...crewAssignments, { projectId: c.projectId, employeeId, day: c.proposedDay! }];
          }
        }
      }

      return {
        projects,
        crewAssignments,
        proposal: { ...s.proposal, status: "applied" },
      };
    }),

  publishSchedule: () =>
    set((s) => (s.proposal ? { proposal: { ...s.proposal, status: "published" } } : s)),
}));

function renumberCell(stops: RouteStop[], employeeId: string, day: ISODate): RouteStop[] {
  const cell = stops
    .filter((r) => r.employeeId === employeeId && r.day === day)
    .sort((a, b) => a.stopNumber - b.stopNumber);
  const idToNumber = new Map(cell.map((r, i) => [r.id, i + 1]));
  return stops.map((r) => (idToNumber.has(r.id) ? { ...r, stopNumber: idToNumber.get(r.id)! } : r));
}
