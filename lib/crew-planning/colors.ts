import type { JobStatus } from "./types";

export const JOB_STATUS_STYLES: Record<JobStatus, { bg: string; text: string; border: string; label: string }> = {
  confirmed: { bg: "#ecfdf5", text: "#065f46", border: "#6ee7b7", label: "Confirmed" },
  proposed: { bg: "#f5f3ff", text: "#6d28d9", border: "#c4b5fd", label: "Proposed" },
  conflict: { bg: "#fef2f2", text: "#b91c1c", border: "#fca5a5", label: "Conflict" },
  unassigned: { bg: "#f3f4f6", text: "#374151", border: "#d1d5db", label: "Unassigned" },
};

export const RECOMMENDATION_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  reassign: { bg: "#ede9fe", text: "#6d28d9", label: "Reassign" },
  compliance: { bg: "#fef3c7", text: "#92400e", label: "Compliance" },
  "needs-dispatcher": { bg: "#fee2e2", text: "#b91c1c", label: "Needs dispatcher" },
};
