import { create } from "zustand";
import { generateAiPlan, parseInstruction } from "./aiPlan";
import { CREW_TEAMS, DEMO_DATE_LABEL, JOBS, TEAM_MEMBERS } from "./fixtures";
import type { AiPlan, CrewTeam, DaySheetMode, Job, PlanConstraints, TeamMember } from "./types";

let idCounter = 1;
function nextId(prefix: string): string {
  idCounter += 1;
  return `${prefix}-${idCounter}`;
}

export type PlanningTab = "planning" | "day-sheet";
export type SyncStatus = "idle" | "syncing";
export type GenerateStatus = "idle" | "generating";

interface CrewPlanningStore {
  dateLabel: string;
  crews: CrewTeam[];
  teamMembers: TeamMember[];
  jobs: Job[];

  activeTab: PlanningTab;
  setActiveTab: (t: PlanningTab) => void;

  selectedJobId: string | null;
  setSelectedJobId: (id: string | null) => void;

  daySheetMode: DaySheetMode;
  setDaySheetMode: (m: DaySheetMode) => void;
  selectedCrewId: string;
  setSelectedCrewId: (id: string) => void;
  selectedMemberId: string | null;
  selectTeamMember: (memberId: string) => void;

  syncStatus: SyncStatus;
  lastSyncedLabel: string;
  syncJobber: () => void;

  generateStatus: GenerateStatus;
  aiPlan: AiPlan | null;
  generatePlan: () => void;
  sendChatMessage: (text: string) => void;
  acceptRecommendation: (id: string) => void;
  skipRecommendation: (id: string) => void;
  discardPlan: () => void;
  applyPlan: () => void;

  assignJob: (jobId: string, crewId: string, startMinutes: number) => void;
}

const DEFAULT_CONSTRAINTS: PlanConstraints = { prioritizeOverdue: false, avoidOvertime: false };

export const useCrewPlanningStore = create<CrewPlanningStore>((set, get) => ({
  dateLabel: DEMO_DATE_LABEL,
  crews: CREW_TEAMS,
  teamMembers: TEAM_MEMBERS,
  jobs: JOBS,

  activeTab: "planning",
  setActiveTab: (t) => set({ activeTab: t }),

  selectedJobId: null,
  setSelectedJobId: (id) => set({ selectedJobId: id }),

  daySheetMode: "byCrew",
  setDaySheetMode: (m) => set({ daySheetMode: m }),
  selectedCrewId: "crew-1",
  setSelectedCrewId: (id) => set({ selectedCrewId: id, selectedMemberId: null }),
  selectedMemberId: null,
  selectTeamMember: (memberId) =>
    set((s) => {
      const owningCrew = s.crews.find((c) => c.memberIds.includes(memberId));
      return { selectedMemberId: memberId, selectedCrewId: owningCrew?.id ?? s.selectedCrewId };
    }),

  syncStatus: "idle",
  lastSyncedLabel: "4 min ago",
  syncJobber: () => {
    set({ syncStatus: "syncing" });
    setTimeout(() => {
      set({ syncStatus: "idle", lastSyncedLabel: "just now" });
    }, 1400);
  },

  generateStatus: "idle",
  aiPlan: null,
  generatePlan: () => {
    set({ generateStatus: "generating" });
    setTimeout(() => {
      const { jobs, crews } = get();
      const { recommendations, summary } = generateAiPlan(jobs, crews, DEFAULT_CONSTRAINTS);
      const intro =
        `Evaluated ${summary.evaluated} Jobs — ${summary.assigned} assigned, ${summary.unassigned} unassigned, ` +
        `${summary.conflictsResolved} conflict${summary.conflictsResolved === 1 ? "" : "s"} resolved.`;
      set({
        generateStatus: "idle",
        aiPlan: {
          recommendations,
          summary,
          chat: [{ id: nextId("msg"), role: "ai", text: intro }],
          constraints: DEFAULT_CONSTRAINTS,
          status: "draft",
        },
      });
    }, 1400);
  },

  sendChatMessage: (text) =>
    set((s) => {
      if (!s.aiPlan) return s;
      const userMsg = { id: nextId("msg"), role: "user" as const, text };
      const parsed = parseInstruction(text);
      if (!parsed.recognized) {
        const aiMsg = {
          id: nextId("msg"),
          role: "ai" as const,
          text: "I couldn't tell what to adjust from that — try \"prioritize overdue Jobs\", \"avoid overtime\", or \"keep crews together\".",
        };
        return { aiPlan: { ...s.aiPlan, chat: [...s.aiPlan.chat, userMsg, aiMsg] } };
      }
      const nextConstraints: PlanConstraints = { ...s.aiPlan.constraints, ...parsed.updates };
      const { recommendations, summary } = generateAiPlan(s.jobs, s.crews, nextConstraints);
      const aiMsg = { id: nextId("msg"), role: "ai" as const, text: `I ${parsed.ackFragments.join(" and ")}.` };
      return {
        aiPlan: {
          ...s.aiPlan,
          constraints: nextConstraints,
          recommendations,
          summary,
          chat: [...s.aiPlan.chat, userMsg, aiMsg],
        },
      };
    }),

  acceptRecommendation: (id) =>
    set((s) => {
      if (!s.aiPlan) return s;
      return {
        aiPlan: {
          ...s.aiPlan,
          recommendations: s.aiPlan.recommendations.map((r) => (r.id === id ? { ...r, status: "accepted" } : r)),
        },
      };
    }),

  skipRecommendation: (id) =>
    set((s) => {
      if (!s.aiPlan) return s;
      return {
        aiPlan: {
          ...s.aiPlan,
          recommendations: s.aiPlan.recommendations.map((r) => (r.id === id ? { ...r, status: "skipped" } : r)),
        },
      };
    }),

  discardPlan: () => set({ aiPlan: null }),

  applyPlan: () =>
    set((s) => {
      if (!s.aiPlan) return s;
      let jobs = s.jobs;
      for (const rec of s.aiPlan.recommendations) {
        if (rec.status !== "accepted") continue;
        if (rec.type === "reassign" && rec.jobId && rec.crewTeamId && rec.startMinutes != null) {
          const start = rec.startMinutes;
          jobs = jobs.map((j) =>
            j.id === rec.jobId
              ? {
                  ...j,
                  status: "confirmed",
                  crewTeamId: rec.crewTeamId!,
                  scheduledStartMinutes: start,
                  scheduledEndMinutes: start + j.durationMinutes,
                  overdue: false,
                }
              : j
          );
        }
      }
      return { jobs, aiPlan: { ...s.aiPlan, status: "applied" } };
    }),

  assignJob: (jobId, crewId, startMinutes) =>
    set((s) => ({
      jobs: s.jobs.map((j) =>
        j.id === jobId
          ? {
              ...j,
              status: "confirmed",
              crewTeamId: crewId,
              scheduledStartMinutes: startMinutes,
              scheduledEndMinutes: startMinutes + j.durationMinutes,
              overdue: false,
            }
          : j
      ),
    })),
}));
