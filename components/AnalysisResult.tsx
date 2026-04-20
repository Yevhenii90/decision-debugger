"use client";

import type { AnalysisResult as AnalysisResultType } from "@/lib/types";

type AnalysisResultProps = {
  result: AnalysisResultType | null;
  isLoading: boolean;
  error: string | null;
};

const sections: Array<{
  key: keyof Pick<
    AnalysisResultType,
    | "strengths"
    | "risks"
    | "assumptions"
    | "improvements"
    | "alternatives"
    | "hard_questions"
  >;
  label: string;
}> = [
  { key: "strengths", label: "Strengths" },
  { key: "risks", label: "Risks" },
  { key: "assumptions", label: "Hidden assumptions" },
  { key: "improvements", label: "Improvements" },
  { key: "alternatives", label: "Alternatives" },
  { key: "hard_questions", label: "Hard questions" },
];

function formatResultForClipboard(result: AnalysisResultType) {
  const lines = [
    result.title,
    "",
    "Overall assessment",
    result.overall_assessment,
  ];

  sections.forEach(({ key, label }) => {
    lines.push("", label);
    result[key].forEach((item) => lines.push(`- ${item}`));
  });

  return lines.join("\n");
}

export function AnalysisResult({ result, isLoading, error }: AnalysisResultProps) {
  async function copyResult() {
    if (!result) {
      return;
    }

    await navigator.clipboard.writeText(formatResultForClipboard(result));
  }

  if (!isLoading && !error && !result) {
    return null;
  }

  return (
    <section aria-labelledby="result-heading" className="cyber-panel rounded-2xl p-5 sm:p-8">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 id="result-heading" className="font-mono text-xl font-semibold uppercase tracking-[0.14em] text-cyan-200">
          Analysis result
        </h2>
        {result ? (
          <button
            type="button"
            onClick={copyResult}
            className="rounded border border-purple-400/50 px-3 py-2 font-mono text-sm font-medium text-purple-200 transition hover:bg-purple-400/10"
          >
            Copy result
          </button>
        ) : null}
      </div>

      {isLoading ? (
        <p role="status" className="font-mono text-sm text-emerald-300">
          Critiquing...
        </p>
      ) : null}

      {error ? (
        <p role="alert" className="rounded border border-pink-400/40 bg-pink-950/30 px-3 py-3 font-mono text-sm text-pink-200">
          {error}
        </p>
      ) : null}

      {result ? (
        <article className="space-y-6">
          <div className="space-y-2">
            <h3 className="font-mono text-2xl font-semibold text-emerald-200">{result.title}</h3>
            <p className="leading-7 text-zinc-200">{result.overall_assessment}</p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {sections.map(({ key, label }) => (
              <section key={key} className="rounded-xl border border-cyan-400/25 bg-black/45 p-4">
                <h4 className="mb-3 font-mono text-sm font-semibold uppercase tracking-[0.12em] text-cyan-200">{label}</h4>
                <ul className="list-disc space-y-2 pl-5 text-sm leading-6 text-zinc-200">
                  {result[key].map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </article>
      ) : null}
    </section>
  );
}
