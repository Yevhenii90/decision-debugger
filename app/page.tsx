"use client";

import { useState } from "react";
import { AnalysisResult } from "@/components/AnalysisResult";
import { DecisionForm } from "@/components/DecisionForm";
import {
  type AnalysisMode,
  type AnalysisResult as AnalysisResultType,
  isAnalysisResult,
} from "@/lib/types";

type AnalyzeInput = {
  decision: string;
  context: string;
  mode: AnalysisMode;
};

export default function Home() {
  const [result, setResult] = useState<AnalysisResultType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleAnalyze(input: AnalyzeInput) {
    if (!input.decision) {
      setError("Enter a decision before analyzing.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(input),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Analysis failed.");
      }

      if (!isAnalysisResult(data.result)) {
        throw new Error("The analysis response was incomplete. Try again.");
      }

      const nextResult = data.result;
      setResult(nextResult);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Something went wrong while analyzing this decision.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col justify-center gap-8 px-4 py-8 sm:px-6 sm:py-12">
      <header className="space-y-3 text-center">
        <h1 className="pixel-title">
          Decision Debugger
        </h1>
        <p className="font-mono text-sm uppercase tracking-[0.28em] text-purple-300 sm:text-base">
          AI-powered decision critique
        </p>
      </header>

      <section className="cyber-panel scanline rounded-2xl p-5 sm:p-8">
        <DecisionForm
          onSubmit={handleAnalyze}
          isLoading={isLoading}
        />
      </section>

      <AnalysisResult result={result} isLoading={isLoading} error={error} />
    </main>
  );
}
