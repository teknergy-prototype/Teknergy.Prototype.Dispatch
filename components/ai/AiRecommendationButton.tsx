"use client";

import { useDispatchStore } from "@/lib/store";
import { Button } from "../ui/Button";
import { SparkleIcon } from "../ui/Icons";

export function AiRecommendationButton() {
  const proposal = useDispatchStore((s) => s.proposal);
  const generateProposal = useDispatchStore((s) => s.generateProposal);
  const openAiPanel = useDispatchStore((s) => s.openAiPanel);

  const hasDraft = proposal?.status === "draft";
  const label = hasDraft ? "Review recommendation" : "Generate schedule recommendation";

  return (
    <Button
      variant="primary"
      className="text-xs"
      onClick={() => (hasDraft ? openAiPanel() : generateProposal())}
    >
      <SparkleIcon size={13} />
      {label}
    </Button>
  );
}
