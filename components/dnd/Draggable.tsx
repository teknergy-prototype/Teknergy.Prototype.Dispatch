"use client";

import { useDraggable } from "@dnd-kit/core";
import type { ReactNode } from "react";
import type { DragItemData } from "@/lib/dnd";

export function Draggable({
  id,
  data,
  disabled,
  children,
  className,
}: {
  id: string;
  data: DragItemData;
  disabled?: boolean;
  children: ReactNode;
  className?: string;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id,
    data,
    disabled,
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={className}
      style={{ opacity: isDragging ? 0.4 : 1, touchAction: "none" }}
    >
      {children}
    </div>
  );
}
