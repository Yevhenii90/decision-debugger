"use client";

import { type FormEvent, useState } from "react";
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

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <label htmlFor="decision" className="block text-sm font-medium text-stone-900">
          What decision are you considering?
        </label>
        <textarea
          id="decision"
          value={decision}
          onChange={(event) => setDecision(event.target.value)}
          placeholder={sampleDecision}
          rows={6}
          required
          className="min-h-44 w-full resize-y rounded border border-stone-300 bg-white px-3 py-3 text-base text-stone-950 outline-none transition focus:border-stone-700 focus:ring-2 focus:ring-stone-200"
        />
      </div>

      <div className="flex justify-center">
        <button
          type="submit"
          disabled={isLoading}
          className="rounded bg-stone-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:bg-stone-400"
        >
          {isLoading ? "Critiquing..." : "Critique"}
        </button>
      </div>
    </form>
  );
}
