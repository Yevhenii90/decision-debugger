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

  return (
    <section aria-labelledby="result-heading" className="w-full border-t border-[#1f7a36] pt-8">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 id="result-heading" className="text-lg font-semibold text-[#7dff91]">
          Analysis result
        </h2>
        {result ? (
          <button
            type="button"
            onClick={copyResult}
            className="rounded border border-[#1f7a36] px-3 py-2 text-sm font-medium text-[#7dff91] transition hover:bg-[#0d1f0d]"
          >
            Copy result
          </button>
        ) : null}
      </div>

      {isLoading ? (
        <p role="status" className="text-sm text-[#d6b85a]">
          Analyzing...
        </p>
      ) : null}

      {error ? (
        <p role="alert" className="rounded border border-[#b84d4d] bg-[#190707] px-3 py-3 text-sm text-[#ff8f8f]">
          {error}
        </p>
      ) : null}

      {!isLoading && !error && !result ? (
        <p className="text-sm text-[#9fbf92]">
          Enter a decision to see a structured analysis here.
        </p>
      ) : null}

      {result ? (
        <article className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-[#d6b85a]">{result.title}</h3>
            <p className="leading-7 text-[#b8ffc2]">{result.overall_assessment}</p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {sections.map(({ key, label }) => (
              <section key={key} className="rounded border border-[#1f7a36] bg-[#071007] p-4">
                <h4 className="mb-3 text-sm font-semibold text-[#7dff91]">{label}</h4>
                <ul className="list-disc space-y-2 pl-5 text-sm leading-6 text-[#b8ffc2]">
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
