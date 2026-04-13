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
): Scores {
  const inputWords = originalInput.trim().split(/\s+/).length;
  const answeredCount = Object.values(clarificationAnswers).filter(
    (v) => v && v.trim().length > 0,
  ).length;

  // Clarity: based on how clearly the user expressed their intent
  let clarity = 5;
  if (inputWords >= 15) clarity++;
  if (inputWords >= 30) clarity++;
  if (!/\b(help|do|stuff|thing|something)\b/i.test(originalInput)) clarity++;
  if (/\b(write|draft|create|analyze|build|plan|design|review)\b/i.test(originalInput)) clarity++;
  if (answeredCount > 0) clarity++;
  clarity = Math.min(clarity, 10);

  // Specificity: based on how much detail was provided
  let specificity = 4;
  if (clarificationAnswers.audience) specificity += 2;
  if (clarificationAnswers.context) specificity++;
  if (clarificationAnswers.constraints) specificity++;
  if (clarificationAnswers.goal) specificity++;
  if (inputWords >= 20) specificity++;
  specificity = Math.min(specificity, 10);

  // Completeness: based on how many aspects were covered
  let completeness = 4;
  if (clarificationAnswers.audience) completeness++;
  if (clarificationAnswers.goal) completeness++;
  if (clarificationAnswers.context) completeness++;
  if (clarificationAnswers.constraints) completeness++;
  if (inputWords >= 10) completeness++;
  if (inputWords >= 25) completeness++;
  completeness = Math.min(completeness, 10);

  // Reliability: based on constraints that reduce hallucination risk
  let reliability = 5;
  if (answeredCount >= 1) reliability++;
  if (answeredCount >= 3) reliability++;
  if (clarificationAnswers.constraints) reliability++;
  if (inputWords >= 15) reliability++;
  if (clarificationAnswers.context) reliability++;
  reliability = Math.min(reliability, 10);

  return { clarity, specificity, completeness, reliability };
}

export function generateExplanation(
  originalInput: string,
  clarificationAnswers: Record<string, string>,
  _scores: Scores,
): ScoreExplanation {
  const bullets: string[] = [];
  const wordCount = originalInput.trim().split(/\s+/).length;

  if (wordCount < 20) {
    bullets.push(
      `Your original was ${wordCount} words. The improved version adds role context, constraints, and structure.`,
    );
  }

  if (!clarificationAnswers.audience) {
    bullets.push(
      "Added a target audience so the AI tailors its language and depth.",
    );
  }

  if (!/\b(don't|avoid|must)\b/i.test(originalInput)) {
    bullets.push(
      "Added constraints to prevent hallucination and assumptions.",
    );
  }

  if (!/\b(format|list|email|essay)\b/i.test(originalInput)) {
    bullets.push(
      "Defined an output format so you get structured, usable results.",
    );
  }

  if (/\b(help|write|make|create|do|fix)\b/i.test(originalInput)) {
    bullets.push(
      "Replaced vague language with specific instructions the AI can act on.",
    );
  }

  bullets.push(
    "Structured prompts with roles, constraints, and formats produce higher-quality AI outputs.",
  );

  return { bullets };
}
