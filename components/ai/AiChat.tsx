"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { useDispatchStore } from "@/lib/store";
import { Button } from "../ui/Button";
import { SendIcon } from "../ui/Icons";

const SUGGESTIONS = [
  "Prioritize overdue Projects",
  "Avoid overtime",
  "Do not assign Carla on Friday",
  "Keep the same crew on Riverside Projects",
];

export function AiChat() {
  const proposal = useDispatchStore((s) => s.proposal);
  const sendChatMessage = useDispatchStore((s) => s.sendChatMessage);
  const [text, setText] = useState("");

  if (!proposal) return null;
  const disabled = proposal.status !== "draft";

  function submit(value?: string) {
    const msg = (value ?? text).trim();
    if (!msg || disabled) return;
    sendChatMessage(msg);
    setText("");
  }

  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-[11px] font-semibold uppercase tracking-wide text-[var(--muted-2)]">
        Adjust with AI
      </h3>

      <div className="flex max-h-52 flex-col gap-2 overflow-y-auto rounded-md border border-[var(--border-subtle)] p-2">
        {proposal.chat.map((m) => (
          <div
            key={m.id}
            className={cn(
              "max-w-[88%] rounded-md px-2.5 py-1.5 text-[11px] leading-snug",
              m.role === "user"
                ? "self-end bg-[var(--foreground)] text-[var(--background)]"
                : "self-start bg-[var(--surface-hover)] text-[var(--foreground)]"
            )}
          >
            {m.text}
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            disabled={disabled}
            onClick={() => submit(s)}
            className="rounded-full border border-[var(--border)] px-2.5 py-1 text-[10px] text-[var(--foreground)] hover:bg-[var(--surface-hover)] disabled:opacity-40"
          >
            {s}
          </button>
        ))}
      </div>

      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Tell AI how to adjust the plan..."
          disabled={disabled}
          className="flex-1 rounded-md border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1.5 text-xs outline-none focus:border-[var(--muted-2)] disabled:opacity-50"
        />
        <Button variant="primary" type="submit" disabled={disabled || !text.trim()} className="!px-2.5">
          <SendIcon size={13} />
        </Button>
      </form>
    </div>
  );
}
