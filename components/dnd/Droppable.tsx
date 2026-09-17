"use client";

import { useDroppable } from "@dnd-kit/core";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import type { DropTargetData } from "@/lib/dnd";

export function Droppable({
  id,
  data,
  isBlocked,
  disabled,
  className,
  activeClassName,
  style,
  children,
}: {
  id: string;
  data: DropTargetData;
  isBlocked?: boolean;
  disabled?: boolean;
  className?: string;
  activeClassName?: string;
  style?: React.CSSProperties;
  children: ReactNode | ((state: { isOver: boolean; blocked: boolean }) => ReactNode);
}) {
  const { setNodeRef, isOver } = useDroppable({ id, data, disabled });
  const blocked = Boolean(isOver && isBlocked);
  const accepted = Boolean(isOver && !isBlocked);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        className,
        accepted && (activeClassName ?? "ring-2 ring-[#198754] ring-inset"),
        blocked && "ring-2 ring-[#dc3545] ring-inset cursor-not-allowed"
      )}
    >
      {typeof children === "function" ? children({ isOver, blocked }) : children}
    </div>
  );
}
