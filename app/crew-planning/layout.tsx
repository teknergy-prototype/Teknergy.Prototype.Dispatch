import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Crew Planning",
  description: "Daily Crew Planning & Crew Day Sheet prototype",
};

export default function CrewPlanningLayout({ children }: LayoutProps<"/crew-planning">) {
  return children;
}
