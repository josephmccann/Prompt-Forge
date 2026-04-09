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
  balancedPrompt: string,
  originalInput: string,
  clarificationAnswers: Record<string, string>,
): Scores {
  let clarity = 5;
  if (balancedPrompt.includes("## Output Format") || balancedPrompt.includes("Format:"))
    clarity++;
  if (balancedPrompt.includes("## Role") || balancedPrompt.includes("You are"))
    clarity++;
  const genericVerbs = /\bhelp\b|\bdo\b/i;
  if (!genericVerbs.test(balancedPrompt.split("## Task")[1] || "")) clarity++;
  if (
    balancedPrompt.includes("tone") ||
    balancedPrompt.includes("Tone") ||
    balancedPrompt.includes("professional") ||
    balancedPrompt.includes("creative") ||
    balancedPrompt.includes("plain")
  )
    clarity++;
  if (balancedPrompt.length < 2500) clarity++;
  clarity = Math.min(clarity, 10);

  let specificity = 4;
  if (
    balancedPrompt.includes("audience") ||
    balancedPrompt.includes("Target audience") ||
    clarificationAnswers.audience
  )
    specificity++;
  if (
    balancedPrompt.includes("background") ||
    balancedPrompt.includes("Background") ||
    balancedPrompt.includes("Context") ||
    clarificationAnswers.context
  )
    specificity++;
  if (balancedPrompt.includes("## Constraints") || balancedPrompt.includes("Constraints:"))
    specificity++;
  const answeredCount = Object.values(clarificationAnswers).filter(
    (v) => v && v.trim().length > 0,
  ).length;
  specificity += Math.min(answeredCount, 3);
  const domainTerms =
    /marketing|software|finance|health|education|legal|travel|culinary|research|analysis|strategy|development|communication/i;
  if (domainTerms.test(balancedPrompt)) specificity++;
  specificity = Math.min(specificity, 10);

  let completeness = 3;
  const sections = [
    "## Role",
    "## Objective",
    "## Context",
    "## Task",
    "## Constraints",
    "## Output Format",
    "## Quality Standard",
  ];
  for (const section of sections) {
    if (balancedPrompt.includes(section)) completeness++;
  }
  completeness = Math.min(completeness, 10);

  let reliability = 4;
  if (/fabricat|hallucin/i.test(balancedPrompt)) reliability++;
  if (/clarifying questions/i.test(balancedPrompt)) reliability++;
  if (
    balancedPrompt.includes("## Output Format") ||
    balancedPrompt.includes("Structure your response")
  )
    reliability++;
  if (balancedPrompt.includes("## Quality Standard")) reliability++;
  if (balancedPrompt.includes("Step-by-Step")) reliability++;
  if (/do not fabricat|don't fabricat|hallucin/i.test(balancedPrompt))
    reliability++;
  reliability = Math.min(reliability, 10);

  return { clarity, specificity, completeness, reliability };
}

export function generateExplanation(
  originalInput: string,
  clarificationAnswers: Record<string, string>,
  scores: Scores,
): ScoreExplanation {
  const bullets: string[] = [];
  const wordCount = originalInput.trim().split(/\s+/).length;

  if (wordCount < 20) {
    bullets.push(
      `Your original was ${wordCount} words. The improved version adds role context, constraints, and structure that guides the AI.`,
    );
  }

  if (!clarificationAnswers.audience) {
    bullets.push(
      "Added a target audience so the AI tailors its language and depth.",
    );
  }

  if (
    !originalInput.toLowerCase().includes("don't") &&
    !originalInput.toLowerCase().includes("avoid") &&
    !originalInput.toLowerCase().includes("must")
  ) {
    bullets.push(
      "Added safety constraints to prevent hallucination and assumptions.",
    );
  }

  if (
    !originalInput.toLowerCase().includes("format") &&
    !originalInput.toLowerCase().includes("list") &&
    !originalInput.toLowerCase().includes("email") &&
    !originalInput.toLowerCase().includes("essay")
  ) {
    bullets.push(
      "Defined an output format so you get structured, usable results.",
    );
  }

  const genericVerbs = /\b(help|write|make|create|do|fix)\b/i;
  if (genericVerbs.test(originalInput)) {
    bullets.push(
      "Replaced vague language with specific instructions the AI can act on.",
    );
  }

  bullets.push(
    "Structured prompts with roles, constraints, and formats consistently produce higher-quality AI outputs.",
  );

  return { bullets };
}
