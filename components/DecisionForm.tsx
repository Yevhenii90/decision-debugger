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
    <form onSubmit={handleSubmit}>
      <div className="mb-6 flex items-center gap-3">
        <div className="text-xl text-cyan-400" aria-hidden="true">
          ◈
        </div>
        <label htmlFor="decision" className="text-2xl font-medium text-white">
          What are you considering?
        </label>
      </div>

      <div className="relative overflow-hidden rounded-xl border border-cyan-400/30 bg-zinc-950 p-6 font-mono text-lg">
        <div className="mb-2 flex gap-4 text-emerald-400">
          <span className="text-zinc-500">01</span>
          <span>{"{"}</span>
        </div>
        <textarea
          id="decision"
          value={decision}
          onChange={(event) => setDecision(event.target.value)}
          onKeyDown={handleDecisionKeyDown}
          placeholder={sampleDecision}
          rows={6}
          required
          className="terminal-input min-h-36 w-full resize-y border-0 bg-transparent pl-8 text-cyan-100 outline-none"
        />
        <div className="mt-4 flex gap-4 text-emerald-400">
          <span className="text-zinc-500">02</span>
          <span>{"}"}</span>
        </div>
      </div>

      <div className="mt-8 flex justify-center">
        <button
          type="submit"
          disabled={isLoading}
          className="btn-critique flex items-center gap-4 rounded-2xl border-2 border-emerald-400 bg-black px-10 py-5 text-xl font-bold uppercase tracking-[0.18em] text-emerald-400 transition-all hover:scale-105 hover:text-white active:scale-95 disabled:cursor-not-allowed disabled:border-zinc-600 disabled:text-zinc-500 sm:px-16 sm:py-6 sm:text-2xl"
        >
          <span className="relative z-10">
            {isLoading ? "Critiquing..." : "⚡ Critique"}
          </span>
        </button>
      </div>
    </form>
  );
}
