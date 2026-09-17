"use client";

import { ROUTE_STATUS_COLORS } from "@/lib/colors";
import { useDispatchStore } from "@/lib/store";
import type { RouteStop } from "@/lib/types";
import { Draggable } from "../dnd/Draggable";
import { Droppable } from "../dnd/Droppable";
import { Badge } from "../ui/Badge";
import { ArrowDownIcon, ArrowUpIcon, XIcon } from "../ui/Icons";

export function RouteStopCard({ stop, isLast, isFirst }: { stop: RouteStop; isLast: boolean; isFirst: boolean }) {
  const projects = useDispatchStore((s) => s.projects);
  const routeTypes = useDispatchStore((s) => s.routeTypes);
  const draggingItem = useDispatchStore((s) => s.draggingItem);
  const removeRouteStop = useDispatchStore((s) => s.removeRouteStop);
  const moveRouteStop = useDispatchStore((s) => s.moveRouteStop);
  const openModal = useDispatchStore((s) => s.openModal);

  const project = projects.find((p) => p.id === stop.projectId);
  const routeType = routeTypes.find((r) => r.id === stop.routeTypeId);
  const statusColor = ROUTE_STATUS_COLORS[stop.routeStatus];

  const isBlocked = draggingItem !== null && draggingItem.kind !== "route-stop";

  return (
    <Droppable
      id={`route-stop-${stop.id}`}
      data={{ kind: "route-stop", stopId: stop.id, employeeId: stop.employeeId, day: stop.day }}
      isBlocked={isBlocked}
      className="w-full min-w-0 rounded-md"
    >
      <Draggable
        id={`drag-route-stop-${stop.id}`}
        data={{ kind: "route-stop", stop }}
        className="w-full min-w-0"
      >
        <div
          onClick={() => project && openModal({ type: "project-detail", projectId: project.id })}
          className="flex w-full min-w-0 cursor-pointer flex-col gap-1 rounded-md border border-[var(--border-subtle)] bg-[var(--surface)] p-2 shadow-sm hover:border-[var(--border)]"
        >
          <div className="flex items-center gap-1.5">
            <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[var(--foreground)] text-[9px] font-bold text-[var(--background)]">
              {stop.stopNumber}
            </span>
            <span className="min-w-0 flex-1 truncate text-xs font-medium text-[var(--foreground)]">
              {project ? project.name : "Unknown project"}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeRouteStop(stop.id);
              }}
              className="shrink-0 text-[var(--muted-2)] hover:text-red-600"
              aria-label="Remove stop"
            >
              <XIcon size={12} />
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-1">
            {routeType && (
              <Badge bg={`${routeType.color}22`} text={routeType.color}>
                {routeType.name}
              </Badge>
            )}
            <Badge bg={statusColor.bg} text={statusColor.text}>
              {stop.routeStatus}
            </Badge>
          </div>
          <div className="flex items-center gap-1 pt-0.5">
            <button
              onClick={(e) => {
                e.stopPropagation();
                moveRouteStop(stop.id, -1);
              }}
              disabled={isFirst}
              className="rounded p-0.5 text-[var(--muted)] hover:bg-[var(--surface-hover)] disabled:opacity-30"
              aria-label="Move up"
            >
              <ArrowUpIcon size={12} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                moveRouteStop(stop.id, 1);
              }}
              disabled={isLast}
              className="rounded p-0.5 text-[var(--muted)] hover:bg-[var(--surface-hover)] disabled:opacity-30"
              aria-label="Move down"
            >
              <ArrowDownIcon size={12} />
            </button>
          </div>
        </div>
      </Draggable>
    </Droppable>
  );
}
