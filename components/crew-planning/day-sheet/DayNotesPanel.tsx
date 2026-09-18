import { DAY_NOTES } from "@/lib/crew-planning/fixtures";

export function DayNotesPanel({ crewId }: { crewId: string }) {
  const notes = DAY_NOTES[crewId] ?? [];
  if (notes.length === 0) return null;

  return (
    <div className="rounded-md border border-[var(--border-subtle)] p-3">
      <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-red-600 dark:text-red-400">Day notes</h3>
      <ul className="flex flex-col gap-1.5 text-[11px] text-[var(--foreground)]">
        {notes.map((n, i) => (
          <li key={i} className="flex gap-1.5">
            <span className="text-[var(--muted-2)]">•</span>
            {n}
          </li>
        ))}
      </ul>
    </div>
  );
}
