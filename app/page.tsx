"use client";

import { useEffect, useState } from "react";
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

const pipelineStages = [
  "Awaiting decision",
  "Stress-testing logic",
  "Scanning hidden risks",
  "Building critique",
  "Critique ready",
] as const;

export default function Home() {
  const [result, setResult] = useState<AnalysisResultType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [pipelineStep, setPipelineStep] = useState(0);

  useEffect(() => {
    if (!isLoading) {
      return;
    }

    const id = window.setInterval(() => {
      setPipelineStep((step) => Math.min(step + 1, 3));
    }, 900);

    return () => window.clearInterval(id);
  }, [isLoading]);

  const activePipelineStep = error
    ? 3
    : result && !isLoading
      ? 4
      : isLoading
        ? pipelineStep
        : 0;
  const pipelineProgress = error
    ? 100
    : activePipelineStep === 0
      ? 14
      : activePipelineStep === 1
        ? 38
        : activePipelineStep === 2
          ? 64
          : activePipelineStep === 3
            ? 86
            : 100;
  const pipelineStatus = error
    ? "REVIEW FAILED"
    : isLoading
      ? "CRITIQUING"
      : result
        ? "READY"
        : "STANDBY";

  async function handleAnalyze(input: AnalyzeInput) {
    if (!input.decision) {
      setError("Enter a decision before analyzing.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);
    setPipelineStep(1);

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
    <main className="cyber-grid mx-auto flex min-h-screen w-full items-center justify-center px-4 py-8 sm:px-6">
      <div className="relative z-10 mx-auto w-full max-w-5xl">
        <header className="mb-10 text-center">
          <h1 className="pixel-title">
            Decision Debugger
          </h1>
          <p className="mt-2 text-2xl uppercase tracking-[0.18em] text-purple-400">
            AI-powered decision analysis
          </p>
        </header>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <section className="lg:col-span-8">
            <div className="rounded-2xl border border-cyan-500/50 bg-black/80 p-5 shadow-2xl shadow-cyan-500/30 backdrop-blur-xl sm:p-8">
              <DecisionForm
                onSubmit={handleAnalyze}
                isLoading={isLoading}
              />
            </div>
          </section>

          <aside className="lg:col-span-4">
            <div className="h-full rounded-2xl border border-purple-500/50 bg-black/70 p-6">
              <h2 className="mb-5 flex items-center gap-2 text-xl font-bold text-purple-400">
                <span aria-hidden="true">◆</span> How it works
              </h2>

              <ul className="space-y-4 text-zinc-300">
                <li>• Ask a decision question.</li>
                <li>• Get a direct critical response.</li>
                <li>• See risks you might be ignoring.</li>
                <li>• Look at your idea from another angle.</li>
              </ul>

              <div className="mt-12 border-t border-zinc-700 pt-6">
                <div className="mb-3 flex justify-between text-xs uppercase tracking-[0.12em]">
                  <span className={error ? "text-pink-400" : "text-emerald-400"}>
                    Critique pipeline
                  </span>
                  <span className={error ? "text-pink-400" : "text-emerald-400"}>
                    {pipelineStatus}
                  </span>
                </div>

                <ol className="space-y-2 text-xs text-zinc-500">
                  {pipelineStages.map((stage, index) => (
                    <li
                      key={stage}
                      className={
                        index === activePipelineStep
                          ? error
                            ? "text-pink-300"
                            : "text-cyan-300"
                          : index < activePipelineStep
                            ? "text-emerald-400"
                            : "text-zinc-600"
                      }
                    >
                      {index < activePipelineStep ? "✓" : index === activePipelineStep ? ">" : "·"}{" "}
                      {stage}
                    </li>
                  ))}
                </ol>

                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-zinc-800">
                  <div
                    className={
                      error
                        ? "h-full bg-pink-400 transition-all duration-500"
                        : "h-full bg-gradient-to-r from-emerald-400 to-cyan-400 transition-all duration-500"
                    }
                    style={{ width: `${pipelineProgress}%` }}
                  />
                </div>

                <div className="mt-3 text-xs text-zinc-500">
                  {error
                    ? "The critique could not be completed. Try again."
                    : isLoading
                      ? "Finding weak spots before answering."
                      : result
                        ? "Critical response generated."
                        : "Ready for a decision question."}
                </div>
              </div>
            </div>
          </aside>
        </div>

        <AnalysisResult result={result} isLoading={isLoading} error={error} />

        <footer className="mt-12 text-center text-sm text-zinc-500">
          v0.8.4 • Neural debug protocol active •{" "}
          <span className="text-cyan-400">Neon City 2077</span>
        </footer>
      </div>
    </main>
  );
}
