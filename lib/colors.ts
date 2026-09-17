// Status / accent color tokens ported from the ERP palette, used as small
// accents (badges, chips, borders) over an otherwise neutral Vercel-style UI.

export const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  Open: { bg: "#d1fae5", text: "#065f46" },
  "In Progress": { bg: "#ffedd5", text: "#9a3412" },
  Scheduled: { bg: "#dbeafe", text: "#1d4ed8" },
  "Change of Order": { bg: "#ede9fe", text: "#6d28d9" },
};

export const DEFAULT_STATUS_COLOR = { bg: "#f3f4f6", text: "#374151" };

export function getStatusColor(status: string): { bg: string; text: string } {
  return STATUS_COLORS[status] ?? DEFAULT_STATUS_COLOR;
}

export const SECTION_COLORS = {
  overdue: { text: "#b45309", bg: "#fffbeb" },
  noDate: { text: "#6b7280", bg: "#f9fafb" },
  activeProjects: { text: "#2563eb", bg: "#eff6ff" },
};

export const DAYOFF_BADGE = { bg: "#fef9c3", text: "#854d0e" };
export const ACTIVITY_BADGE = { bg: "#f3e8ff", text: "#6b21a8" };
export const PTO_CHIP = { bg: "#dbeafe", text: "#1d4ed8" };

export const ROUTE_STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  Pending: { bg: "#f3f4f6", text: "#374151" },
  "In Progress": { bg: "#dbeafe", text: "#1d4ed8" },
  Completed: { bg: "#d1fae5", text: "#065f46" },
};

export const ACCENT_GREEN = "#198754";
export const ACCENT_RED = "#dc3545";
export const TODAY_BG = "#e8f5e9";
export const LOCKED_GRAY = "#adb5bd";

const AVATAR_PALETTE = [
  "#2563eb",
  "#7c3aed",
  "#db2777",
  "#d97706",
  "#059669",
  "#0891b2",
  "#4f46e5",
  "#b91c1c",
  "#0d9488",
  "#c026d3",
];

export function colorForId(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
    hash |= 0;
  }
  const idx = Math.abs(hash) % AVATAR_PALETTE.length;
  return AVATAR_PALETTE[idx];
}
