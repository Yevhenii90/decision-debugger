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

  function handleClear() {
    setResult(null);
    setError(null);
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-8 px-4 py-8 sm:px-6 sm:py-12">
      <header className="space-y-2 text-center">
        <h1 className="pixel-title">
          Decision Debugger
        </h1>
      </header>

      <section className="rounded border border-stone-200 bg-white p-4 sm:p-6">
        <DecisionForm
          onSubmit={handleAnalyze}
          onClear={handleClear}
          isLoading={isLoading}
        />
      </section>

      <AnalysisResult result={result} isLoading={isLoading} error={error} />
    </main>
  );
}
