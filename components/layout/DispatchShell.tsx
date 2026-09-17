"use client";

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { isEmployeeOffOn } from "@/lib/availability";
import { isProjectLocked } from "@/lib/queue";
import { useDispatchStore } from "@/lib/store";
import type { DragItemData, DropTargetData } from "@/lib/dnd";
import { AvailabilityGrid } from "../availability/AvailabilityGrid";
import { AiRecommendationPanel } from "../ai/AiRecommendationPanel";
import { DragPreview } from "../dnd/DragPreview";
import { ModalsRoot } from "../modals/ModalsRoot";
import { RoutesGrid } from "../routes/RoutesGrid";
import { ScheduleGrid } from "../schedule/ScheduleGrid";
import { WorkloadGrid } from "../workload/WorkloadGrid";
import { Sidebar } from "../sidebar/Sidebar";
import { DateRangeBar } from "./DateRangeBar";
import { FilterBar } from "./FilterBar";
import { PrototypeBanner } from "./PrototypeBanner";
import { ThemeToggle } from "./ThemeToggle";
import { ViewTabs } from "./ViewTabs";

export function DispatchShell() {
  const activeView = useDispatchStore((s) => s.activeView);
  const projects = useDispatchStore((s) => s.projects);
  const availabilityEntries = useDispatchStore((s) => s.availabilityEntries);
  const draggingItem = useDispatchStore((s) => s.draggingItem);
  const setDraggingItem = useDispatchStore((s) => s.setDraggingItem);
  const openModal = useDispatchStore((s) => s.openModal);
  const reorderRouteStops = useDispatchStore((s) => s.reorderRouteStops);
  const aiPanelOpen = useDispatchStore((s) => s.aiPanelOpen);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  function handleDragStart(event: DragStartEvent) {
    setDraggingItem((event.active.data.current as DragItemData) ?? null);
  }

  function handleDragEnd(event: DragEndEvent) {
    setDraggingItem(null);
    const { active, over } = event;
    if (!over) return;
    const dragData = active.data.current as DragItemData | undefined;
    const dropData = over.data.current as DropTargetData | undefined;
    if (!dragData || !dropData) return;

    const projectsById = new Map(projects.map((p) => [p.id, p]));

    if (dropData.kind === "day-header") {
      if (dragData.kind !== "project") return;
      if (isProjectLocked(dragData.project, projectsById)) {
        openModal({ type: "locked-notice", projectName: dragData.project.name });
        return;
      }
      openModal({ type: "schedule-project", projectId: dragData.project.id, day: dropData.day });
      return;
    }

    if (dropData.kind === "project-card") {
      const project = projectsById.get(dropData.projectId);
      if (!project) return;
      if (isProjectLocked(project, projectsById)) {
        openModal({ type: "locked-notice", projectName: project.name });
        return;
      }
      if (dragData.kind === "crew") {
        if (isEmployeeOffOn(availabilityEntries, dragData.employee.id, dropData.day)) {
          openModal({
            type: "dayoff-blocked",
            employeeName: dragData.employee.name,
            day: dropData.day,
          });
          return;
        }
        openModal({
          type: "assign-crew",
          projectId: project.id,
          employeeId: dragData.employee.id,
          day: dropData.day,
        });
        return;
      }
      if (dragData.kind === "equipment") {
        openModal({
          type: "assign-equipment",
          projectId: project.id,
          equipmentId: dragData.equipment.id,
          day: dropData.day,
        });
        return;
      }
      return;
    }

    if (dropData.kind === "crew-chip") {
      if (dragData.kind !== "equipment") return;
      const project = projectsById.get(dropData.projectId);
      if (!project) return;
      if (isProjectLocked(project, projectsById)) {
        openModal({ type: "locked-notice", projectName: project.name });
        return;
      }
      openModal({
        type: "assign-equipment",
        projectId: project.id,
        equipmentId: dragData.equipment.id,
        day: dropData.day,
        employeeId: dropData.employeeId,
      });
      return;
    }

    if (dropData.kind === "routes-cell") {
      if (dragData.kind !== "project") return;
      openModal({
        type: "add-route-stop",
        employeeId: dropData.employeeId,
        day: dropData.day,
        projectId: dragData.project.id,
      });
      return;
    }

    if (dropData.kind === "route-stop") {
      if (dragData.kind !== "route-stop") return;
      if (dragData.stop.id === dropData.stopId) return;
      reorderRouteStops(dropData.employeeId, dropData.day, dragData.stop.id, dropData.stopId);
      return;
    }

    if (dropData.kind === "availability-cell") {
      if (dragData.kind !== "crew") return;
      if (dragData.employee.id !== dropData.employeeId) return;
      openModal({ type: "add-availability", employeeId: dropData.employeeId, day: dropData.day });
      return;
    }
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setDraggingItem(null)}
    >
      <div className="flex h-screen flex-col bg-[var(--background)] text-[var(--foreground)]">
        <PrototypeBanner />
        <header className="flex items-center justify-between border-b border-[var(--border-subtle)] px-4 py-3">
          <div className="flex items-center gap-1.5 text-sm">
            <span className="font-semibold">Dispatch</span>
          </div>
          <ThemeToggle />
        </header>

        <ViewTabs />
        <DateRangeBar />
        <FilterBar />

        <div className="flex min-h-0 flex-1">
          {activeView !== "workload" && <Sidebar />}
          {activeView === "schedule" && <ScheduleGrid />}
          {activeView === "routes" && <RoutesGrid />}
          {activeView === "workload" && <WorkloadGrid />}
          {activeView === "availability" && <AvailabilityGrid />}
          {activeView === "schedule" && aiPanelOpen && <AiRecommendationPanel />}
        </div>
      </div>

      <DragOverlay>{draggingItem ? <DragPreview item={draggingItem} /> : null}</DragOverlay>

      <ModalsRoot />
    </DndContext>
  );
}
