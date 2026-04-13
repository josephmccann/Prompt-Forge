export interface Scores {
  clarity: number;
  specificity: number;
  completeness: number;
  reliability: number;
}

export interface ScoreExplanation {
  bullets: string[];
}

export function scorePrompt(
  _balancedPrompt: string,
  originalInput: string,
  clarificationAnswers: Record<string, string>,
  depth?: string,
): Scores {
  const inputWords = originalInput.trim().split(/\s+/).length;
  const answeredCount = Object.values(clarificationAnswers).filter(
    (v) => v && v.trim().length > 0,
  ).length;

  // Clarity: how clearly the AI will understand what to do
  let clarity = 5;
  if (inputWords >= 15) clarity++;
  if (inputWords >= 30) clarity++;
  if (!/\b(help|do|stuff|thing|something)\b/i.test(originalInput)) clarity++;
  if (/\b(write|draft|create|analyze|build|plan|design|review)\b/i.test(originalInput)) clarity++;
  if (answeredCount > 0) clarity++;
  clarity = Math.min(clarity, 10);

  // Specificity: how targeted the generated prompt will be
  let specificity = 4;
  if (clarificationAnswers.audience) specificity += 2; // audience tailoring is high-impact
  if (clarificationAnswers.context) specificity++;
  if (clarificationAnswers.constraints) specificity++;
  if (clarificationAnswers.goal) specificity++;
  if (inputWords >= 20) specificity++;
  specificity = Math.min(specificity, 10);

  // Completeness: how many proven techniques are included
  let completeness = 5; // base: role, format, constraints always present
  if (clarificationAnswers.audience) completeness++;  // audience-aware tailoring
  if (clarificationAnswers.goal) completeness++;       // explicit goal
  if (answeredCount >= 2) completeness++;              // few-shot + verification kick in
  if (depth === "Thorough") completeness++;            // chain-of-thought added
  if (inputWords >= 15) completeness++;                // enough detail for good context
  completeness = Math.min(completeness, 10);

  // Reliability: how likely the AI is to stay on-track
  let reliability = 5;
  if (answeredCount >= 1) reliability++;
  if (answeredCount >= 3) reliability++;
  if (clarificationAnswers.constraints) reliability++;
  if (depth === "Thorough") reliability++;  // CoT improves reasoning accuracy
  if (clarificationAnswers.context) reliability++;
  reliability = Math.min(reliability, 10);

  return { clarity, specificity, completeness, reliability };
}

export function generateExplanation(
  originalInput: string,
  clarificationAnswers: Record<string, string>,
  _scores: Scores,
  depth?: string,
): ScoreExplanation {
  const bullets: string[] = [];
  const wordCount = originalInput.trim().split(/\s+/).length;

  if (wordCount < 20) {
    bullets.push(
      `Your original was ${wordCount} words. The improved version adds role, context, few-shot examples, and a verification step.`,
    );
  }

  bullets.push(
    "Included a few-shot example so the AI sees the expected output quality before responding.",
  );

  if (clarificationAnswers.audience) {
    bullets.push(
      `Added audience-aware instructions — the AI will tailor language and depth for: ${clarificationAnswers.audience}.`,
    );
  } else {
    bullets.push(
      "Added a target audience instruction so the AI tailors its language and depth.",
    );
  }

  if (depth === "Thorough") {
    bullets.push(
      "Added chain-of-thought reasoning — the AI will outline its logic step by step before writing, improving accuracy on complex tasks.",
    );
  }

  if (!/\b(don't|avoid|must)\b/i.test(originalInput)) {
    bullets.push(
      "Added constraints framed as positive instructions (\"state uncertainty\" instead of \"don't guess\"), which research shows LLMs follow more reliably.",
    );
  }

  if (!/\b(format|list|email|essay)\b/i.test(originalInput)) {
    bullets.push(
      "Defined an output format so you get structured, usable results.",
    );
  }

  bullets.push(
    "Added a self-verification step — the AI checks its own work against quality criteria before finalizing.",
  );

  return { bullets };
}
