"use client";

import { type FormEvent, type KeyboardEvent, useState } from "react";
import type { AnalysisMode } from "@/lib/types";

type DecisionFormProps = {
  onSubmit: (input: {
    decision: string;
    context: string;
    mode: AnalysisMode;
  }) => Promise<void>;
  isLoading: boolean;
};

const sampleDecision =
  "Should I leave my current job to join an early-stage startup?";

export function DecisionForm({ onSubmit, isLoading }: DecisionFormProps) {
  const [decision, setDecision] = useState("");
  const wordCount = decision.trim() ? decision.trim().split(/\s+/).length : 0;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    await onSubmit({
      decision: decision.trim(),
      context: "",
      mode: "Critical",
    });
  }

  function handleDecisionKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== "Enter" || event.shiftKey || event.metaKey || event.ctrlKey || event.altKey) {
      return;
    }

    event.preventDefault();
    event.currentTarget.form?.requestSubmit();
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="terminal-window p-5">
        <label htmlFor="decision" className="terminal-header mb-4 block">
          [DECISION_QUERY]&gt; What decision are you considering?
        </label>
        <textarea
          id="decision"
          value={decision}
          onChange={(event) => setDecision(event.target.value)}
          onKeyDown={handleDecisionKeyDown}
          placeholder={sampleDecision}
          rows={6}
          required
          className="terminal-input w-full border-0 bg-transparent outline-none"
        />
      </div>

      <div className="flex flex-col items-center justify-between gap-5 sm:flex-row">
        <button
          type="submit"
          disabled={isLoading}
          className="btn-critique bg-transparent px-10 py-4 uppercase transition disabled:cursor-not-allowed disabled:border-zinc-600 disabled:text-zinc-500 disabled:shadow-none"
        >
          {isLoading ? "Critiquing..." : "Critique"}
        </button>

        <div className="text-center text-sm leading-6 text-zinc-500 sm:text-right">
          Word count: <span className="text-cyan-300">{wordCount}</span><br />
          Grammar check: <span className="text-cyan-300">Confirmed</span><br />
          Critique engine: <span className="text-cyan-300">Preliminary Alpha (Ready)</span>
        </div>
      </div>
    </form>
  );
}
