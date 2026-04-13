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
  Education: "an expert educator and curriculum designer",
  Coding: "a senior software engineer and technical mentor",
  Cooking: "a professional chef and recipe developer",
  "General Intelligence": "a knowledgeable generalist with broad expertise across many fields",
  "Deep Research": "an academic researcher specializing in systematic literature review and evidence synthesis",
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
  Education: "Explain concepts progressively from foundational to advanced. Use analogies and concrete examples to build understanding.",
  Coding: "Provide working code with clear comments. Explain the reasoning behind design choices, not just the syntax.",
  Cooking: "Include exact measurements, temperatures, and timing. Note substitutions for common dietary restrictions.",
  "General Intelligence": "Draw connections across disciplines. Provide a well-rounded answer that considers multiple perspectives.",
  "Deep Research": "Trace claims to primary sources. Evaluate methodology quality, identify consensus vs. debate, and flag gaps in the literature.",
};

const QUALITY_STANDARDS: Record<string, string> = {
  Personal: "addresses the specific situation, provides actionable advice, and anticipates follow-up questions",
  Work: "is professionally polished, well-structured, and ready to share with colleagues or stakeholders",
  Writing: "has a clear voice, logical flow, smooth transitions, and engaging prose",
  Research: "is well-sourced, balanced, distinguishes fact from opinion, and identifies knowledge gaps",
  Planning: "is realistic, accounts for dependencies, includes measurable milestones, and considers risks",
  Creative: "surprises with unexpected angles, offers multiple distinct directions, and pushes beyond the obvious",
  Education: "builds understanding progressively, uses clear analogies, includes practice exercises or self-check questions, and adapts to the learner's level",
  Coding: "produces correct, runnable code with clear explanations, handles edge cases, and follows the conventions of the language or framework",
  Cooking: "produces a recipe that a home cook can follow on the first try, with clear timing, visual cues for doneness, and practical tips",
  "General Intelligence": "synthesizes information across domains, provides a balanced and nuanced answer, and acknowledges the limits of its knowledge",
  "Deep Research": "systematically covers the evidence landscape, evaluates source quality, identifies where experts agree and disagree, and highlights open questions",
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
  Education: {
    input: "Explain how photosynthesis works for a 10-year-old",
    output: "Think of a leaf as a tiny kitchen. **Ingredients:** sunlight (the stove), water (from roots), and CO2 (from air). **Recipe:** The leaf mixes these using chlorophyll (the green stuff) to cook glucose (plant food) and release oxygen (what we breathe). **Try this:** Put a leaf in water in sunlight and watch tiny bubbles form — that's the oxygen!",
  },
  Coding: {
    input: "Write a function to debounce user input in TypeScript",
    output: "```typescript\nfunction debounce<T extends (...args: any[]) => void>(fn: T, ms: number) {\n  let timer: ReturnType<typeof setTimeout>;\n  return (...args: Parameters<T>) => {\n    clearTimeout(timer);\n    timer = setTimeout(() => fn(...args), ms);\n  };\n}\n```\n**Why this works:** Each keystroke resets the timer. The function only fires once the user stops typing for `ms` milliseconds. `ReturnType<typeof setTimeout>` keeps it platform-agnostic (works in Node and browsers).",
  },
  Cooking: {
    input: "Give me a weeknight pasta recipe under 30 minutes",
    output: "**Lemon Garlic Butter Pasta (serves 2, 20 min)**\n1. Boil 200g spaghetti in salted water (1 tbsp salt per liter). Reserve 1 cup pasta water before draining.\n2. While pasta cooks: melt 2 tbsp butter over medium heat, add 4 sliced garlic cloves, cook until golden (~2 min). Watch closely — golden not brown.\n3. Add juice of 1 lemon + ½ cup pasta water. Toss in drained pasta. Season with salt, pepper, red pepper flakes. Finish with parmesan.\n**Substitutions:** Dairy-free? Use olive oil instead of butter, skip parmesan. Gluten-free? Use GF pasta, add 30 sec to cook time.",
  },
  "General Intelligence": {
    input: "Why do some countries drive on the left?",
    output: "**Historical origin:** Most people are right-handed. Medieval horseback riders kept left so their sword arm (right) faced oncoming traffic. **Why it split:** Napoleon standardized right-side driving across his empire. Britain, unconquered, kept left — and exported it to colonies (India, Australia, Japan via British naval influence). **Today:** ~35% of countries drive on the left, almost all with British colonial ties. **Fun nuance:** Sweden switched from left to right in 1967 (Dagen H) — accident rates briefly dropped because everyone drove extra carefully.",
  },
  "Deep Research": {
    input: "What does the evidence say about the effectiveness of spaced repetition for long-term learning?",
    output: "**Consensus (strong):** Spaced repetition significantly outperforms massed practice for long-term retention. Meta-analysis by Cepeda et al. (2006, Psychological Bulletin, k=317 studies) found a robust effect (d=0.85).\n**Mechanism:** The \"desirable difficulty\" framework (Bjork, 1994) — forgetting and re-retrieving strengthens memory traces.\n**Optimal intervals:** Pimsleur (1967) proposed expanding gaps; Wozniak's SM-2 algorithm (used by Anki) dynamically adjusts. No single schedule dominates — effectiveness is robust across variations.\n**Limitation:** Most studies use factual recall (vocabulary, anatomy). Evidence for complex skill transfer (e.g., problem-solving) is thinner (Dunlosky et al., 2013).\n**Open question:** How to optimally space conceptual vs. procedural knowledge remains under-studied.",
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
  Education: "teaching and learning",
  Coding: "software engineering",
  Cooking: "culinary arts and home cooking",
  "General Intelligence": "general knowledge across disciplines",
  "Deep Research": "academic research and evidence synthesis",
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
    Education: "Would a student at the target level understand this? Are there examples and a way to self-check understanding?",
    Coding: "Does the code run correctly? Are edge cases handled? Is the reasoning behind design choices explained?",
    Cooking: "Could a home cook follow this on the first try? Are measurements exact, timing clear, and substitutions noted?",
    "General Intelligence": "Is the answer balanced across perspectives? Are connections between ideas made explicit?",
    "Deep Research": "Are primary sources cited? Is methodology quality evaluated? Are areas of expert disagreement flagged?",
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
