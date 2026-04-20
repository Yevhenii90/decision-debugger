import { NextResponse } from "next/server";
import { buildAnalysisPrompt } from "@/lib/prompt";
import {
  type AnalyzeRequest,
  type AnalysisResult,
  isAnalysisMode,
  isAnalysisResult,
} from "@/lib/types";

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";

function extractJsonObject(content: string) {
  try {
    return JSON.parse(content);
  } catch {
    const start = content.indexOf("{");
    const end = content.lastIndexOf("}");

    if (start === -1 || end === -1 || end <= start) {
      return null;
    }

    try {
      return JSON.parse(content.slice(start, end + 1));
    } catch {
      return null;
    }
  }
}

function validateRequest(body: unknown): AnalyzeRequest | null {
  if (!body || typeof body !== "object") {
    return null;
  }

  const candidate = body as Record<string, unknown>;

  if (
    typeof candidate.decision !== "string" ||
    typeof candidate.context !== "string" ||
    !isAnalysisMode(candidate.mode)
  ) {
    return null;
  }

  const decision = candidate.decision.trim();
  const context = candidate.context.trim();

  if (!decision) {
    return null;
  }

  return {
    decision,
    context,
    mode: candidate.mode,
  };
}

function buildLocalAnalysis(input: AnalyzeRequest): AnalysisResult {
  const decision = input.decision;
  const shortDecision =
    decision.length > 72 ? `${decision.slice(0, 69).trim()}...` : decision;

  const modeNote =
    input.mode === "Critical"
      ? "The main value is in stress-testing the reasoning before committing time."
      : input.mode === "Practical"
        ? "The main value is in turning this into a small, testable next step."
        : input.mode === "Fast check"
          ? "This is worth a quick check before spending serious time on it."
          : "This looks reasonable only if the expected payoff is clear enough to justify the time.";

  return {
    title: `Decision check: ${shortDecision}`,
    overall_assessment: `${modeNote} The decision should be judged by its expected usefulness, the opportunity cost, and whether it solves a current problem rather than just feeling generally worthwhile.`,
    strengths: [
      "It can create clarity if the material directly connects to a current goal or gap.",
      "It is low-risk if you timebox it and define what useful output should look like.",
      "It may expose blind spots that are hard to notice through routine work alone.",
    ],
    risks: [
      "The activity can become passive consumption if there is no concrete question to answer.",
      "It may compete with higher-value work if the timing or expected payoff is vague.",
      "The source may be too broad, outdated, or mismatched to your actual QA needs.",
    ],
    assumptions: [
      "The material is relevant to the decisions or skills you need right now.",
      "Reading it will change behavior, not just increase familiarity.",
      "You have enough time to extract and apply the useful parts.",
    ],
    improvements: [
      "Define one specific reason for reading it before starting.",
      "Timebox the first pass and stop if it does not answer a real question.",
      "Write down three actionable takeaways and one thing you will test in practice.",
    ],
    alternatives: [
      "Skim the table of contents first and only read the most relevant sections.",
      "Ask a QA peer which parts are actually useful before committing more time.",
      "Use the same time to solve one concrete QA problem and consult the material only when blocked.",
    ],
    hard_questions: [
      "What exact decision or skill gap should this reading help with?",
      "What would make you stop reading after 20 minutes?",
      "What will you do differently if the material is useful?",
    ],
  };
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const input = validateRequest(body);

  if (!input) {
    return NextResponse.json(
      { error: "Provide a decision, context, and valid analysis mode." },
      { status: 400 },
    );
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ result: buildLocalAnalysis(input) });
  }

  try {
    const response = await fetch(OPENAI_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "You return only valid JSON for structured decision analysis. Never include markdown.",
          },
          {
            role: "user",
            content: buildAnalysisPrompt(input),
          },
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "The analysis service returned an error." },
        { status: 502 },
      );
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;

    if (typeof content !== "string") {
      return NextResponse.json(
        { error: "The analysis service returned an empty response." },
        { status: 502 },
      );
    }

    const parsed = extractJsonObject(content);

    if (!isAnalysisResult(parsed)) {
      return NextResponse.json(
        { error: "The analysis response was malformed. Please try again." },
        { status: 502 },
      );
    }

    return NextResponse.json({ result: parsed });
  } catch {
    return NextResponse.json(
      { error: "Unable to analyze this decision right now." },
      { status: 500 },
    );
  }
}
