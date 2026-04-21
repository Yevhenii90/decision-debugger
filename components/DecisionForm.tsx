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
    <form onSubmit={handleSubmit} className="space-y-7">
      <div className="space-y-4">
        <label htmlFor="decision" className="block font-mono text-xl text-cyan-200">
          What decision are you considering?
        </label>
        <textarea
          id="decision"
          value={decision}
          onChange={(event) => setDecision(event.target.value)}
          onKeyDown={handleDecisionKeyDown}
          placeholder={sampleDecision}
          rows={6}
          required
          className="terminal-input min-h-52 w-full resize-y rounded-xl border border-cyan-400/40 bg-zinc-950 px-4 py-4 text-emerald-100 outline-none transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-300/20"
        />
      </div>

      <div className="flex justify-center">
        <button
          type="submit"
          disabled={isLoading}
          className="group rounded-2xl border-2 border-emerald-300 bg-black px-10 py-4 font-mono text-lg font-bold uppercase tracking-[0.18em] text-emerald-300 transition hover:bg-emerald-300/15 hover:text-white disabled:cursor-not-allowed disabled:border-zinc-600 disabled:text-zinc-500 sm:px-16"
        >
          {isLoading ? "Critiquing..." : "Critique"}
        </button>
      </div>
    </form>
  );
}
