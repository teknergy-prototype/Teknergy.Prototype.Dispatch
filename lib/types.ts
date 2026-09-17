// Core domain types for the Dispatch prototype (mock data only, no backend).

export type ISODate = string; // 'yyyy-MM-dd'

export interface Address {
  street: string;
  city: string;
  state: string;
  zip: string;
}

export interface ServiceCategory {
  id: string;
  name: string;
  color: string; // hex
}

export interface RouteTypeDef {
  id: string;
  name: string;
  color: string; // hex
}

export type ProjectStatus =
  | "Open"
  | "In Progress"
  | "Scheduled"
  | "Change of Order"
  | "Approved"
  | "Completed"
  | "On Hold";

export type ProjectPriority = "Low" | "Medium" | "High";

export interface Project {
  id: string;
  parentProjectId?: string;
  name: string;
  status: ProjectStatus;
  statusColor?: string; // optional override
  beginDate: ISODate | null;
  endDate: ISODate | null;
  workDays: ISODate[];
  address: Address;
  hasSignedEstimate: boolean;
  serviceCategory: ServiceCategory;
  priority?: ProjectPriority;
  /** Skills/certifications a crew member must have to be assigned (AI recommendation). */
  requiredSkills?: string[];
}

export interface Employee {
  id: string;
  name: string;
  avatarColor: string;
  /** Certifications/skills used by the AI recommendation to match qualified crew. */
  skills?: string[];
}

export type EquipmentType = "equipment" | "vehicle";

export interface Equipment {
  id: string;
  name: string;
  type: EquipmentType;
}

export interface CrewAssignment {
  projectId: string;
  employeeId: string;
  day: ISODate;
}

export type EquipmentScope = "project" | "member-day" | "member-whole-project";

export interface EquipmentAssignment {
  id: string;
  equipmentId: string;
  scope: EquipmentScope;
  projectId: string;
  employeeId?: string;
  day?: ISODate;
}

export type RouteStatus = "Pending" | "In Progress" | "Completed";

export interface RouteStop {
  id: string;
  employeeId: string;
  projectId: string;
  day: ISODate;
  stopNumber: number;
  routeTypeId: string;
  routeStatus: RouteStatus;
}

export type AvailabilityCategory = "dayoff" | "activity";

export interface AvailabilityEntry {
  id: string;
  employeeId: string;
  category: AvailabilityCategory;
  type: string;
  reason: string;
  startDate: ISODate;
  endDate: ISODate;
  isPTO: boolean;
}

export type ViewKey = "schedule" | "routes" | "availability" | "workload";

export type RangeMode = "1day" | "3day" | "7day" | "custom";

// --- AI schedule recommendation (mock, deterministic, client-only) ---

export type ChangeType = "new-assignment" | "reschedule" | "reassign-crew" | "unassigned";
export type ChangeStatus = "pending" | "accepted" | "rejected";

export interface ProposedChange {
  id: string;
  projectId: string;
  type: ChangeType;
  previousDay: ISODate | null;
  previousCrewIds: string[];
  proposedDay: ISODate | null;
  proposedCrewIds: string[];
  reason: string;
  status: ChangeStatus;
}

export interface ProposalSummary {
  evaluated: number;
  assigned: number;
  unassigned: number;
  conflictsResolved: number;
  estimatedOvertimeHours: number;
}

export interface ChatMessage {
  id: string;
  role: "user" | "ai";
  text: string;
}

export interface AIConstraints {
  prioritizeOverdue: boolean;
  avoidOvertime: boolean;
  excludedCrewDay: { employeeId: string; day: ISODate }[];
  pinnedGroups: string[];
}

export type ProposalStatus = "draft" | "applied" | "published";

export interface Proposal {
  scopeDays: ISODate[];
  summary: ProposalSummary;
  changes: ProposedChange[];
  chat: ChatMessage[];
  constraints: AIConstraints;
  status: ProposalStatus;
  iteration: number;
}
