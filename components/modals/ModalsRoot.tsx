"use client";

import { useDispatchStore } from "@/lib/store";
import { AddAvailabilityModal } from "./AddAvailabilityModal";
import { AddRouteStopModal } from "./AddRouteStopModal";
import { AssignCrewModal } from "./AssignCrewModal";
import { AssignEquipmentModal } from "./AssignEquipmentModal";
import { HistoryModal } from "./HistoryModal";
import { DayOffBlockedModal, LockedNoticeModal } from "./NoticeModals";
import { ProjectDetailModal } from "./ProjectDetailModal";
import { ScheduleProjectModal } from "./ScheduleProjectModal";

/**
 * Each modal is mounted only while it is the active modal, keyed by its
 * target identity — this gives every modal fresh initial form state on
 * open without needing an effect to resync it.
 */
export function ModalsRoot() {
  const activeModal = useDispatchStore((s) => s.activeModal);
  if (!activeModal) return null;

  switch (activeModal.type) {
    case "schedule-project":
      return (
        <ScheduleProjectModal
          key={`${activeModal.projectId}-${activeModal.day}`}
          projectId={activeModal.projectId}
          day={activeModal.day}
        />
      );
    case "assign-crew":
      return (
        <AssignCrewModal
          key={`${activeModal.projectId}-${activeModal.employeeId}-${activeModal.day}`}
          projectId={activeModal.projectId}
          employeeId={activeModal.employeeId}
          day={activeModal.day}
        />
      );
    case "assign-equipment":
      return (
        <AssignEquipmentModal
          key={`${activeModal.projectId}-${activeModal.equipmentId}-${activeModal.employeeId ?? ""}-${activeModal.day}`}
          projectId={activeModal.projectId}
          equipmentId={activeModal.equipmentId}
          employeeId={activeModal.employeeId}
          day={activeModal.day}
        />
      );
    case "locked-notice":
      return <LockedNoticeModal projectName={activeModal.projectName} />;
    case "dayoff-blocked":
      return <DayOffBlockedModal employeeName={activeModal.employeeName} day={activeModal.day} />;
    case "add-route-stop":
      return (
        <AddRouteStopModal
          key={`${activeModal.employeeId}-${activeModal.day}-${activeModal.projectId ?? ""}`}
          employeeId={activeModal.employeeId}
          day={activeModal.day}
          projectId={activeModal.projectId}
        />
      );
    case "add-availability":
      return (
        <AddAvailabilityModal
          key={`${activeModal.employeeId}-${activeModal.day}`}
          employeeId={activeModal.employeeId}
          day={activeModal.day}
        />
      );
    case "project-detail":
      return <ProjectDetailModal key={activeModal.projectId} projectId={activeModal.projectId} />;
    case "history":
      return <HistoryModal projectId={activeModal.projectId} />;
    default:
      return null;
  }
}
