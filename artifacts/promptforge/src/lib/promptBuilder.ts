export interface PromptInput {
  originalInput: string;
  useCase: string;
  tone: string;
  depth: string;
  clarificationAnswers: Record<string, string>;
}

export interface GeneratedPrompts {
  balanced: string;
  concise: string;
  maxControl: string;
}

const ROLE_MAP: Record<string, string> = {
  Personal: "a helpful personal assistant",
  Work: "a senior professional consultant",
  Writing: "an experienced writer and editor",
  Research: "a thorough research analyst",
  Planning: "a strategic planning advisor",
  Creative: "a creative director and ideation specialist",
};

const FORMAT_MAP: Record<string, string> = {
  Quick: "A concise response in 2-3 paragraphs or a short bullet list",
  Standard: "A well-organized response with clear sections and examples where helpful",
  Thorough: "A comprehensive, detailed response with sections, examples, considerations, and actionable next steps",
};

const TONE_CONSTRAINTS: Record<string, string> = {
  Simple: "Use plain, everyday language. Avoid jargon and technical terms.",
  Professional: "Maintain a professional, polished tone throughout.",
  Detailed: "Be thorough and precise. Include relevant details and nuances.",
  Creative: "Use engaging, vivid language. Be inventive and original in your approach.",
};

const USECASE_CONSTRAINTS: Record<string, string> = {
  Personal: "Keep the response practical and actionable for everyday use.",
  Work: "Ensure the response is suitable for a professional workplace context.",
  Writing: "Focus on clarity, flow, and engaging prose.",
  Research: "Cite sources where possible and distinguish between facts and interpretations.",
  Planning: "Include timelines, milestones, and contingency considerations.",
  Creative: "Push beyond obvious solutions. Offer unexpected angles and fresh perspectives.",
};

const QUALITY_STANDARDS: Record<string, string> = {
  Personal: "addresses the specific situation, provides actionable advice, and anticipates follow-up questions",
  Work: "is professionally polished, well-structured, and ready to share with colleagues or stakeholders",
  Writing: "has a clear voice, logical flow, smooth transitions, and engaging prose",
  Research: "is well-sourced, balanced, distinguishes fact from opinion, and identifies knowledge gaps",
  Planning: "is realistic, accounts for dependencies, includes measurable milestones, and considers risks",
  Creative: "surprises with unexpected angles, offers multiple distinct directions, and pushes beyond the obvious",
};

function buildContext(input: PromptInput): string {
  const parts: string[] = [];
  if (input.clarificationAnswers.audience) {
    parts.push(`Target audience: ${input.clarificationAnswers.audience}`);
  }
  if (input.clarificationAnswers.goal) {
    parts.push(`Desired outcome: ${input.clarificationAnswers.goal}`);
  }
  if (input.clarificationAnswers.context) {
    parts.push(`Background: ${input.clarificationAnswers.context}`);
  }
  if (input.clarificationAnswers.constraints) {
    parts.push(`Requirements: ${input.clarificationAnswers.constraints}`);
  }
  if (input.clarificationAnswers.tone) {
    parts.push(`Preferred tone: ${input.clarificationAnswers.tone}`);
  }
  if (input.clarificationAnswers.format) {
    parts.push(`Desired format: ${input.clarificationAnswers.format}`);
  }
  return parts.length > 0 ? parts.join(". ") + "." : "The user is seeking assistance with the task described above.";
}

function getSpecificActionVerb(input: string): string {
  const lower = input.toLowerCase();
  if (/write|draft|compose/.test(lower)) return "write";
  if (/plan|organize|schedule/.test(lower)) return "develop a plan for";
  if (/explain|teach|describe/.test(lower)) return "provide a clear explanation of";
  if (/analyze|review|evaluate/.test(lower)) return "analyze";
  if (/create|build|make|design/.test(lower)) return "create";
  if (/fix|solve|resolve|debug/.test(lower)) return "diagnose and resolve";
  if (/improve|optimize|enhance/.test(lower)) return "improve";
  if (/research|investigate|find/.test(lower)) return "research and compile findings on";
  if (/summarize|condense/.test(lower)) return "summarize";
  return "assist with";
}

function getDomain(useCase: string, input: string): string {
  const lower = input.toLowerCase();
  if (/marketing|brand|advertis/.test(lower)) return "marketing and brand strategy";
  if (/code|programming|software|app|website|api/.test(lower)) return "software development";
  if (/email|communication|letter/.test(lower)) return "professional communication";
  if (/data|analytics|metrics/.test(lower)) return "data analysis";
  if (/finance|budget|invest/.test(lower)) return "financial planning";
  if (/health|medical|wellness/.test(lower)) return "health and wellness";
  if (/education|learn|teach|study/.test(lower)) return "education and learning";
  if (/travel|trip|vacation/.test(lower)) return "travel planning";
  if (/food|recipe|cook|meal/.test(lower)) return "culinary arts";
  if (/legal|law|contract/.test(lower)) return "legal guidance";
  const domainMap: Record<string, string> = {
    Personal: "personal productivity",
    Work: "professional consulting",
    Writing: "content creation and writing",
    Research: "research and analysis",
    Planning: "strategic planning",
    Creative: "creative ideation",
  };
  return domainMap[useCase] || "general assistance";
}

export function buildPrompts(input: PromptInput): GeneratedPrompts {
  const role = ROLE_MAP[input.useCase] || ROLE_MAP.Personal;
  const domain = getDomain(input.useCase, input.originalInput);
  const format = FORMAT_MAP[input.depth] || FORMAT_MAP.Standard;
  const toneConstraint = TONE_CONSTRAINTS[input.tone] || TONE_CONSTRAINTS.Simple;
  const useCaseConstraint = USECASE_CONSTRAINTS[input.useCase] || USECASE_CONSTRAINTS.Personal;
  const qualityStandard = QUALITY_STANDARDS[input.useCase] || QUALITY_STANDARDS.Personal;
  const context = buildContext(input);
  const actionVerb = getSpecificActionVerb(input.originalInput);

  const balanced = `## Role
You are ${role} with expertise in ${domain}.

## Objective
Your goal is to ${actionVerb} a response that delivers clear, actionable results tailored to the user's specific situation.

## Context
Here is the relevant background: ${context}

## Task
Please ${actionVerb} the following: ${input.originalInput}

Restate the core request in your own words before beginning to ensure alignment.

## Constraints
- Do not fabricate information. If uncertain, say so.
- Ask clarifying questions before making assumptions.
- ${useCaseConstraint}
- ${toneConstraint}

## Output Format
Structure your response as: ${format}

## Quality Standard
A strong response will: ${qualityStandard}.`;

  const concise = `You are ${role}. ${actionVerb.charAt(0).toUpperCase() + actionVerb.slice(1)} the following: ${input.originalInput}${context !== "The user is seeking assistance with the task described above." ? " " + context : ""}

Constraints: Do not fabricate information. ${toneConstraint}

Format: ${format}`;

  const maxControl = `<role>
You are ${role} with expertise in ${domain}.
</role>

<objective>
Your goal is to ${actionVerb} a response that delivers clear, actionable results tailored to the user's specific situation.
</objective>

<context>
Here is the relevant background: ${context}
</context>

<task>
Please ${actionVerb} the following: ${input.originalInput}

Restate the core request in your own words before beginning to ensure alignment.
</task>

<constraints>
- Do not fabricate information. If uncertain, say so.
- Ask clarifying questions before making assumptions.
- ${useCaseConstraint}
- ${toneConstraint}
- Do not use filler phrases like "Great question!" or "Sure, I'd be happy to help."
- If the request is ambiguous, list your assumptions explicitly before proceeding.
</constraints>

<format>
Structure your response as: ${format}
</format>

## Step-by-Step Instructions
1. Read the full task and context carefully before responding.
2. Restate the core request in one sentence to confirm understanding.
3. Identify any ambiguities or missing information — state assumptions if needed.
4. Structure your response according to the output format specified above.
5. Review your response for accuracy, completeness, and tone alignment.
6. Ensure all constraints are satisfied before finalizing.

## What NOT To Do
- Do not provide generic, one-size-fits-all responses.
- Do not ignore the specified tone or format requirements.
- Do not make claims without supporting evidence or reasoning.
- Do not pad the response with unnecessary filler or repetition.

## Evaluation Criteria
A perfect response will:
- Directly address every aspect of the task with specificity.
- Follow the exact output format and tone specified.
- ${qualityStandard}.
- Be immediately usable without requiring significant edits or follow-up.`;

  return { balanced, concise, maxControl };
}
