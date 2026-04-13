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
  Research: "Ground claims in evidence. Distinguish facts from interpretations and note where evidence is limited.",
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

// Few-shot example stubs keyed by use case — gives the AI a concrete
// demonstration of the expected output shape so it doesn't guess.
const EXAMPLE_STUBS: Record<string, { input: string; output: string }> = {
  Personal: {
    input: "Help me get more organized",
    output: "Here is a 3-step system tailored to your schedule: (1) Capture — write every task into one inbox…  (2) Prioritize — each morning pick your top 3…  (3) Review — spend 5 minutes each evening…",
  },
  Work: {
    input: "Draft talking points for my quarterly review",
    output: "**Opening:** Reference the team's Q3 revenue target (+12%) and your direct contribution…  **Key wins:** Led the migration project (delivered 2 weeks early, saved $40k)…  **Growth area:** Propose a stretch goal around cross-functional leadership…",
  },
  Writing: {
    input: "Write an opening paragraph for a blog about remote work",
    output: "Three years ago, 'working from home' meant sneaking in a load of laundry between Zoom calls. Today it's a $5 billion industry reshaping how cities are designed, how teams collaborate, and who gets hired. Here's what most guides get wrong…",
  },
  Research: {
    input: "Summarize the pros and cons of intermittent fasting",
    output: "**Evidence for:** Two RCTs (Varady 2013, Harvie 2011) showed 3-8% weight loss over 12 weeks…  **Evidence against:** A 2023 NEJM review found no long-term advantage over calorie restriction…  **Knowledge gap:** Limited data on effects beyond 12 months…",
  },
  Planning: {
    input: "Plan a product launch in 6 weeks",
    output: "**Week 1-2:** Finalize messaging and landing page (owner: Marketing). Milestone: copy approved by Day 10…  **Week 3-4:** Beta testing with 50 users. Milestone: NPS > 40…  **Week 5-6:** Press outreach and launch day checklist. Risk: if beta NPS < 30, delay launch 1 week…",
  },
  Creative: {
    input: "Give me ideas for a coffee shop brand name",
    output: "1. **Grounded** — plays on coffee grounds + being grounded/calm. Works for a mindfulness-themed café…  2. **Second Draft** — nods to writers and the 'second cup.' Appeals to creative professionals…  3. **Steep & Stay** — invites lingering; crosses tea and coffee language…",
  },
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
  return parts.length > 0 ? parts.join(". ") + "." : "";
}

function buildAudienceInstruction(input: PromptInput): string {
  const audience = input.clarificationAnswers.audience;
  if (!audience) return "";
  return `\n- Tailor the language, complexity, and examples to suit this audience: ${audience}.`;
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

const DOMAIN_KEYWORDS: [RegExp, string][] = [
  [/marketing|brand|advertis/, "marketing and brand strategy"],
  [/code|programming|software|app|website|api/, "software development"],
  [/email|communication|letter/, "professional communication"],
  [/data|analytics|metrics/, "data analysis"],
  [/finance|budget|invest/, "financial planning"],
  [/health|medical|wellness/, "health and wellness"],
  [/education|learn|teach|study/, "education and learning"],
  [/travel|trip|vacation/, "travel planning"],
  [/food|recipe|cook|meal/, "culinary arts"],
  [/legal|law|contract/, "legal guidance"],
];

const USECASE_DOMAINS: Record<string, string> = {
  Personal: "personal productivity",
  Work: "professional consulting",
  Writing: "content creation and writing",
  Research: "research and analysis",
  Planning: "strategic planning",
  Creative: "creative ideation",
};

function getDomain(useCase: string, input: string): string {
  const lower = input.toLowerCase();
  for (const [pattern, domain] of DOMAIN_KEYWORDS) {
    if (pattern.test(lower)) return domain;
  }
  return USECASE_DOMAINS[useCase] || "general assistance";
}

function buildFewShotExample(useCase: string): string {
  const example = EXAMPLE_STUBS[useCase];
  if (!example) return "";
  return `
## Example
<example>
User: ${example.input}
Assistant: ${example.output}
</example>
Use this as a reference for the level of specificity and structure expected — do not copy it literally.`;
}

function buildChainOfThought(depth: string): string {
  if (depth === "Thorough") {
    return "\n\nThink through this step by step. Outline your reasoning before writing the final response, so each section builds logically on the last.";
  }
  return "";
}

function buildVerificationStep(useCase: string): string {
  const checks: Record<string, string> = {
    Personal: "Is the advice specific to the user's situation, not generic? Are next steps clear?",
    Work: "Is the tone workplace-appropriate? Could a colleague act on this immediately?",
    Writing: "Does the prose flow naturally? Is the voice consistent throughout?",
    Research: "Are claims supported by evidence? Are knowledge gaps acknowledged?",
    Planning: "Are milestones measurable? Are risks and contingencies identified?",
    Creative: "Are the ideas genuinely distinct from each other? Do they go beyond the obvious?",
  };
  return checks[useCase] || "Does the response directly address the request and follow the specified format?";
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
  const audienceInstruction = buildAudienceInstruction(input);
  const fewShotExample = buildFewShotExample(input.useCase);
  const cotInstruction = buildChainOfThought(input.depth);
  const verificationCheck = buildVerificationStep(input.useCase);

  const contextBlock = context
    ? `\n## Context\n${context}`
    : "";

  const balanced = `## Role
You are ${role} with expertise in ${domain}.

## Objective
${actionVerb.charAt(0).toUpperCase() + actionVerb.slice(1)} a response that delivers clear, actionable results tailored to the user's specific situation.
${contextBlock}

## Task
${input.originalInput}

Restate the core request in your own words before beginning to ensure alignment.${cotInstruction}

## Constraints
- State uncertainty rather than guessing. If information is missing, say so.
- Ask clarifying questions before making assumptions.
- ${useCaseConstraint}
- ${toneConstraint}${audienceInstruction}

## Output Format
${format}
${fewShotExample}

## Quality Check
Before finalizing, verify: ${verificationCheck}

A strong response ${qualityStandard}.`;

  const conciseContext = context ? " " + context : "";
  const concise = `You are ${role}. ${actionVerb.charAt(0).toUpperCase() + actionVerb.slice(1)} the following: ${input.originalInput}${conciseContext}

Be specific — state uncertainty rather than guessing. ${toneConstraint}

Format: ${format}`;

  const maxControl = `<role>
You are ${role} with expertise in ${domain}.
</role>

<objective>
${actionVerb.charAt(0).toUpperCase() + actionVerb.slice(1)} a response that delivers clear, actionable results tailored to the user's specific situation.
</objective>
${context ? `\n<context>\n${context}\n</context>` : ""}
<task>
${input.originalInput}

Restate the core request in your own words before beginning to ensure alignment.${cotInstruction}
</task>

<constraints>
- State uncertainty rather than guessing. If information is missing, say so.
- Ask clarifying questions before making assumptions.
- ${useCaseConstraint}
- ${toneConstraint}${audienceInstruction}
- Respond directly without filler phrases like "Great question!" or "Sure, I'd be happy to help."
- If the request is ambiguous, list your assumptions explicitly before proceeding.
</constraints>

<format>
${format}
</format>

<example>
User: ${EXAMPLE_STUBS[input.useCase]?.input || "Help me with this task"}
Assistant: ${EXAMPLE_STUBS[input.useCase]?.output || "A structured, specific response tailored to the request."}
</example>
Use the example above as a reference for specificity and structure — do not copy it literally.

<instructions>
1. Read the full task and context carefully before responding.
2. Restate the core request in one sentence to confirm understanding.
3. Identify any ambiguities or missing information — state assumptions if needed.
4. Structure your response according to the output format specified above.
5. Review your response against these criteria: ${verificationCheck}
6. Ensure all constraints are satisfied before finalizing.
</instructions>

<evaluation_criteria>
A perfect response will:
- Directly address every aspect of the task with specificity.
- Follow the exact output format and tone specified.
- ${qualityStandard}.
- Be immediately usable without requiring significant edits or follow-up.
</evaluation_criteria>`;

  return { balanced, concise, maxControl };
}
