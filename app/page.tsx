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
    <main className="mx-auto flex min-h-screen w-full flex-col items-center justify-center gap-8 px-4 py-8 sm:px-6 sm:py-12">
      <section className="app-container p-6 sm:p-10">
        <header className="text-center">
          <h1 className="pixel-title">
            Decision Debugger
          </h1>
        </header>

        <DecisionForm
          onSubmit={handleAnalyze}
          isLoading={isLoading}
        />

        <div className="footer-status mt-8 flex flex-col justify-between gap-2 pt-4 text-xs sm:flex-row">
          <div>System: Decision Analysis Harmony v1.2</div>
          <div>Status: {isLoading ? "Critiquing..." : "Waiting for input..."}</div>
        </div>
      </section>

      <AnalysisResult result={result} isLoading={isLoading} error={error} />
    </main>
  );
}
