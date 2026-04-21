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
    <main className="cyber-grid mx-auto flex min-h-screen w-full items-center justify-center px-4 py-8 sm:px-6">
      <div className="scanline relative z-10 mx-auto w-full max-w-5xl">
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
                <span aria-hidden="true">◆</span> Debug protocol
              </h2>

              <ul className="space-y-4 text-zinc-300">
                <li>• Critical mode locked</li>
                <li>• Language match enabled</li>
                <li>• Enter submits query</li>
                <li>• Shift + Enter inserts line break</li>
              </ul>

              <div className="mt-12 border-t border-zinc-700 pt-6">
                <div className="mb-2 flex justify-between text-xs">
                  <span className="text-emerald-400">SYSTEM ONLINE</span>
                  <span className="text-emerald-400">
                    {isLoading ? "PROCESSING" : "READY"}
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-zinc-800">
                  <div className="h-full w-[98%] bg-gradient-to-r from-emerald-400 to-cyan-400" />
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
