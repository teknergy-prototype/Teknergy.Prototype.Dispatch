"use client";

import dynamic from "next/dynamic";

const CrewPlanningShell = dynamic(
  () => import("@/components/crew-planning/CrewPlanningShell").then((m) => m.CrewPlanningShell),
  { ssr: false }
);

export default function CrewPlanningPage() {
  return <CrewPlanningShell />;
}
