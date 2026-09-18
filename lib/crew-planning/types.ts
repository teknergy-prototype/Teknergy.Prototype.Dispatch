// Domain model for the Daily Crew Planning / Crew Day Sheet prototype.
// Deliberately separate from the Dispatch prototype's data model — this one
// mimics a Jobber-connected cleaning-company workflow (Jobs, Crew teams of
// 2+ people, a single operational day) rather than multi-day Projects.

export type ServiceType =
  | "Deep Cleaning"
  | "Commercial Cleaning"
  | "Standard Cleaning"
  | "Recurring Home Cleaning"
  | "Move-out Cleaning"
  | "Post-construction";

export type JobStatus = "confirmed" | "proposed" | "conflict" | "unassigned";

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatarColor: string;
}

export interface CrewTeam {
  id: string;
  name: string;
  memberIds: string[];
  vehicle: string;
  dispatcherName: string;
}

export interface Job {
  id: string;
  jobberAppointmentId?: string;
  customerName: string;
  address: string;
  phone?: string;
  contactName?: string;
  serviceType: ServiceType;
  status: JobStatus;
  crewTeamId: string | null;
  scheduledStartMinutes: number | null;
  scheduledEndMinutes: number | null;
  durationMinutes: number;
  accessNote?: string;
  accessCode?: string;
  serviceInstructions?: string;
  clientWindowLabel?: string;
  overdue?: boolean;
  overdueSince?: string;
  conflictNote?: string;
  travelInMinutes?: number;
  travelFromLabel?: string;
  unassignedReason?: string;
}

export type ItineraryItemType =
  | "checkin"
  | "load-equipment"
  | "travel"
  | "job"
  | "break"
  | "lunch"
  | "return-office"
  | "end-day";

export interface ItineraryItem {
  id: string;
  type: ItineraryItemType;
  startMinutes: number;
  endMinutes: number;
  label: string;
  detail?: string;
  jobId?: string;
  miles?: number;
  warning?: string;
}

export type RecommendationType = "reassign" | "compliance" | "needs-dispatcher";
export type RecommendationStatus = "pending" | "accepted" | "skipped";

export interface PlanRecommendation {
  id: string;
  type: RecommendationType;
  title: string;
  detail: string;
  crewTeamId?: string;
  jobId?: string;
  timeLabel?: string;
  startMinutes?: number;
  status: RecommendationStatus;
  canDecide: boolean;
}

export interface PlanSummary {
  evaluated: number;
  assigned: number;
  unassigned: number;
  conflictsResolved: number;
  avgCrewTimeMinutes: number;
}

export interface ChatMessage {
  id: string;
  role: "user" | "ai";
  text: string;
}

export interface PlanConstraints {
  prioritizeOverdue: boolean;
  avoidOvertime: boolean;
}

export interface AiPlan {
  recommendations: PlanRecommendation[];
  summary: PlanSummary;
  chat: ChatMessage[];
  constraints: PlanConstraints;
  status: "draft" | "applied";
}

export type DaySheetMode = "byCrew" | "byMember";

export type AcknowledgmentStatus = "pending" | "sent-by-email" | "acknowledged";
