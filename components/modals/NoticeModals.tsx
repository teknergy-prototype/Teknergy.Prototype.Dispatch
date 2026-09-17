"use client";

import { useDispatchStore } from "@/lib/store";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { BanIcon, WarningIcon } from "../ui/Icons";

export function LockedNoticeModal({ projectName }: { projectName: string }) {
  const closeModal = useDispatchStore((s) => s.closeModal);

  return (
    <Modal open onClose={closeModal} title="Estimate not signed">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 shrink-0 text-[#adb5bd]">
          <BanIcon size={20} />
        </span>
        <p className="text-xs text-[var(--muted)]">
          <span className="font-medium text-[var(--foreground)]">{projectName}</span> doesn&apos;t
          have a signed estimate yet. Scheduling and crew/equipment assignments are locked until the
          estimate is signed.
        </p>
      </div>
      <div className="mt-4 flex justify-end">
        <Button variant="primary" onClick={closeModal}>
          Got it
        </Button>
      </div>
    </Modal>
  );
}

export function DayOffBlockedModal({ employeeName, day }: { employeeName: string; day: string }) {
  const closeModal = useDispatchStore((s) => s.closeModal);

  return (
    <Modal open onClose={closeModal} title="Crew member unavailable">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 shrink-0 text-[#dc3545]">
          <WarningIcon size={20} />
        </span>
        <p className="text-xs text-[var(--muted)]">
          <span className="font-medium text-[var(--foreground)]">{employeeName}</span> has a day off
          on <span className="font-medium text-[var(--foreground)]">{day}</span>. They can&apos;t be
          assigned that day.
        </p>
      </div>
      <div className="mt-4 flex justify-end">
        <Button variant="primary" onClick={closeModal}>
          Got it
        </Button>
      </div>
    </Modal>
  );
}
