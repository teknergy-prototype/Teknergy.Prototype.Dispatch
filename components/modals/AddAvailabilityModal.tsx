"use client";

import { useState } from "react";
import { useDispatchStore } from "@/lib/store";
import type { AvailabilityCategory } from "@/lib/types";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";

const DAYOFF_TYPES = ["Vacation", "Sick", "Personal", "Holiday"];
const ACTIVITY_TYPES = ["Training", "Meeting", "Other"];

export function AddAvailabilityModal({ employeeId, day }: { employeeId: string; day: string }) {
  const closeModal = useDispatchStore((s) => s.closeModal);
  const addAvailabilityEntry = useDispatchStore((s) => s.addAvailabilityEntry);
  const employees = useDispatchStore((s) => s.employees);

  const [category, setCategory] = useState<AvailabilityCategory>("dayoff");
  const [type, setType] = useState(DAYOFF_TYPES[0]);
  const [startDate, setStartDate] = useState(day);
  const [endDate, setEndDate] = useState(day);
  const [reason, setReason] = useState("");
  const [isPTO, setIsPTO] = useState(false);

  const employee = employees.find((e) => e.id === employeeId);
  const typeOptions = category === "dayoff" ? DAYOFF_TYPES : ACTIVITY_TYPES;
  const reasonRequired = category === "activity";
  const canConfirm = Boolean(startDate) && Boolean(endDate) && (!reasonRequired || reason.trim().length > 0);

  return (
    <Modal open onClose={closeModal} title="Add availability">
      <p className="mb-3 text-xs text-[var(--muted)]">
        For <span className="font-medium text-[var(--foreground)]">{employee?.name}</span>
      </p>

      <div className="mb-3 flex gap-2">
        <label className="flex flex-1 cursor-pointer items-center gap-2 rounded-md border border-[var(--border)] p-2 hover:bg-[var(--surface-hover)]">
          <input
            type="radio"
            checked={category === "dayoff"}
            onChange={() => {
              setCategory("dayoff");
              setType(DAYOFF_TYPES[0]);
            }}
            className="accent-[var(--foreground)]"
          />
          <span className="text-xs font-medium">Day Off</span>
        </label>
        <label className="flex flex-1 cursor-pointer items-center gap-2 rounded-md border border-[var(--border)] p-2 hover:bg-[var(--surface-hover)]">
          <input
            type="radio"
            checked={category === "activity"}
            onChange={() => {
              setCategory("activity");
              setType(ACTIVITY_TYPES[0]);
            }}
            className="accent-[var(--foreground)]"
          />
          <span className="text-xs font-medium">Other Activity</span>
        </label>
      </div>

      <label className="mb-3 block">
        <span className="mb-1 block text-[11px] font-medium text-[var(--muted)]">Type</span>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1.5 text-xs"
        >
          {typeOptions.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </label>

      <div className="mb-3 flex gap-2">
        <label className="flex-1">
          <span className="mb-1 block text-[11px] font-medium text-[var(--muted)]">Start date</span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1.5 text-xs"
          />
        </label>
        <label className="flex-1">
          <span className="mb-1 block text-[11px] font-medium text-[var(--muted)]">End date</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1.5 text-xs"
          />
        </label>
      </div>

      <label className="mb-3 block">
        <span className="mb-1 block text-[11px] font-medium text-[var(--muted)]">
          Reason {reasonRequired && <span className="text-red-500">*</span>}
        </span>
        <input
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder={reasonRequired ? "Required for other activity" : "Optional"}
          className="w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1.5 text-xs"
        />
      </label>

      {category === "dayoff" && (
        <label className="mb-1 flex cursor-pointer items-center gap-2 text-xs text-[var(--muted)]">
          <input
            type="checkbox"
            checked={isPTO}
            onChange={(e) => setIsPTO(e.target.checked)}
            className="accent-[var(--foreground)]"
          />
          From an approved PTO request
        </label>
      )}

      <div className="mt-4 flex justify-end gap-2">
        <Button variant="ghost" onClick={closeModal}>
          Cancel
        </Button>
        <Button
          variant="primary"
          disabled={!canConfirm}
          onClick={() => {
            addAvailabilityEntry({
              employeeId,
              category,
              type,
              reason,
              startDate,
              endDate,
              isPTO,
            });
            closeModal();
          }}
        >
          Add
        </Button>
      </div>
    </Modal>
  );
}
