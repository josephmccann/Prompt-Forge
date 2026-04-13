const GENERIC_VERBS = new Set(["help", "write", "make", "create", "plan", "explain", "do", "fix", "build"]);

const SPECIFIC_SUBJECTS = new Set([
  "email", "letter", "report", "essay", "code", "plan", "presentation", "resume",
  "article", "blog", "story", "proposal", "script", "document", "schedule", "budget",
  "website", "app", "database", "marketing", "sales", "product", "project", "strategy",
  "analysis", "review", "summary", "outline", "guide", "tutorial", "recipe", "speech",
  "cover letter", "business plan", "social media", "content", "campaign", "pitch",
]);

const SPECIFIC_ACTIONS = new Set([
  "write", "draft", "create", "design", "develop", "analyze", "review", "edit",
  "improve", "optimize", "organize", "summarize", "research", "compare", "evaluate",
  "implement", "build", "plan", "schedule", "prepare", "compose", "generate",
  "revise", "rewrite", "refactor", "debug", "test", "deploy", "manage",
]);

export interface VaguenessResult {
  isVague: boolean;
  missingAspects: string[];
  questions: { key: string; question: string }[];
}

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function hasSpecificSubjectAndAction(text: string): boolean {
  const lower = text.toLowerCase();
  const words = lower.split(/\s+/);
  const hasSubject = words.some((w) => SPECIFIC_SUBJECTS.has(w)) ||
    /cover letter|business plan|social media/.test(lower);
  const hasAction = words.some((w) => SPECIFIC_ACTIONS.has(w));
  return hasSubject && hasAction;
}

function hasOnlyGenericVerbs(text: string): boolean {
  const words = text.toLowerCase().split(/\s+/);
  const verbsFound = words.filter((w) => GENERIC_VERBS.has(w));
  if (verbsFound.length === 0) return false;
  const hasSpecificSubject = words.some((w) => SPECIFIC_SUBJECTS.has(w)) ||
    /cover letter|business plan|social media/.test(text.toLowerCase());
  return !hasSpecificSubject;
}

function detectMissingAspects(text: string): string[] {
  const lower = text.toLowerCase();
  const missing: string[] = [];

  if (!/\b(for my|for the|for a|audience|reader|client|boss|team|student|customer|user)\b/.test(lower)) {
    missing.push("audience");
  }

  if (!/\b(goal|objective|purpose|outcome|want to|need to|trying to|looking to|in order to|so that)\b/.test(lower)) {
    missing.push("goal");
  }

  if (!/\b(must|should|cannot|can't|don't|avoid|require|deadline|budget|word count|format|maximum|minimum|at least|no more than)\b/.test(lower)) {
    missing.push("constraints");
  }

  if (!/\b(because|since|context|background|situation|industry|company|project|currently|based on|given that|working on)\b/.test(lower)) {
    missing.push("context");
  }

  return missing;
}

// Generic fallback questions
const GENERIC_QUESTIONS: Record<string, { key: string; question: string }> = {
  audience: {
    key: "audience",
    question: "Who is this for? (e.g., my boss, a client, students, myself)",
  },
  goal: {
    key: "goal",
    question: "What's the main goal or outcome you want?",
  },
  constraints: {
    key: "constraints",
    question: "Any specific requirements or things to avoid?",
  },
  context: {
    key: "context",
    question: "Any background info that would help? (industry, topic area, situation)",
  },
};

// Use-case-specific questions — these are more targeted than the generic ones
// and ask about things that matter most for each category.
const USECASE_QUESTIONS: Record<string, { key: string; question: string }[]> = {
  Education: [
    { key: "level", question: "What grade or level is this for? (e.g., high school, AP, college intro, graduate)" },
    { key: "subject", question: "What's the specific subject or assignment? (e.g., essay on The Great Gatsby, learn derivatives)" },
    { key: "constraints", question: "Any requirements? (e.g., word count, citation style, topics to cover)" },
    { key: "goal", question: "What do you need most — understanding a concept, writing help, or study prep?" },
  ],
  Coding: [
    { key: "language", question: "What language or framework? (e.g., Python, React, Node.js, Swift)" },
    { key: "context", question: "What are you building or fixing? Describe the broader project briefly." },
    { key: "level", question: "What's your experience level with this? (beginner, intermediate, advanced)" },
    { key: "constraints", question: "Any constraints? (e.g., no external libraries, must run in browser, performance-critical)" },
  ],
  Cooking: [
    { key: "servings", question: "How many people are you cooking for?" },
    { key: "constraints", question: "Any dietary needs? (e.g., vegetarian, gluten-free, dairy-free, nut allergy)" },
    { key: "level", question: "What's your cooking skill level? (beginner, comfortable, experienced)" },
    { key: "context", question: "Any equipment or time constraints? (e.g., only a microwave, under 30 minutes, meal prep)" },
  ],
  "General Intelligence": [
    { key: "depth", question: "How deep do you want to go — quick overview or thorough explanation?" },
    { key: "audience", question: "Who is this for? (e.g., explaining to a friend, preparing for an interview, personal curiosity)" },
    { key: "context", question: "What prompted this question? Any specific angle you're interested in?" },
    { key: "constraints", question: "Anything you already know that I can build on instead of repeating?" },
  ],
  "Deep Research": [
    { key: "scope", question: "How focused or broad? (e.g., one specific study, a full literature review, a particular time period)" },
    { key: "field", question: "What field or discipline? (e.g., psychology, economics, medicine, computer science)" },
    { key: "goal", question: "What will you use this for? (e.g., academic paper, decision-making, personal understanding)" },
    { key: "constraints", question: "Any source preferences? (e.g., peer-reviewed only, recent studies, specific journals)" },
  ],
  Research: [
    { key: "goal", question: "What will you use this research for? (e.g., report, presentation, decision-making)" },
    { key: "scope", question: "How broad or narrow? (e.g., quick summary, comprehensive analysis, specific subtopic)" },
    { key: "context", question: "Any background info or specific angle you're interested in?" },
    { key: "constraints", question: "Any requirements? (e.g., recent sources only, specific format, word limit)" },
  ],
  Writing: [
    { key: "audience", question: "Who will read this? (e.g., blog readers, academic reviewers, social media followers)" },
    { key: "goal", question: "What should the reader feel or do after reading? (e.g., be informed, be persuaded, be entertained)" },
    { key: "constraints", question: "Any requirements? (e.g., word count, tone, publication it's for)" },
    { key: "context", question: "Any existing material to build on, or starting from scratch?" },
  ],
  Work: [
    { key: "audience", question: "Who will see this? (e.g., my manager, a client, the whole team, external stakeholders)" },
    { key: "goal", question: "What's the goal? (e.g., get approval, inform, persuade, document)" },
    { key: "context", question: "Any relevant background? (e.g., industry, company size, what's already been tried)" },
    { key: "constraints", question: "Any format or tone requirements? (e.g., formal, concise, follows a template)" },
  ],
  Creative: [
    { key: "audience", question: "Who is this for? (e.g., social media, a client pitch, personal project)" },
    { key: "goal", question: "What vibe or direction? (e.g., playful, edgy, minimalist, premium)" },
    { key: "constraints", question: "Any boundaries? (e.g., brand guidelines, topics to avoid, must include something specific)" },
    { key: "context", question: "Any examples of work you like or want to riff on?" },
  ],
  Planning: [
    { key: "goal", question: "What does success look like when this plan is done?" },
    { key: "context", question: "What resources do you have? (e.g., budget, team size, tools already in use)" },
    { key: "constraints", question: "Any hard deadlines or non-negotiable requirements?" },
    { key: "audience", question: "Who needs to approve or follow this plan?" },
  ],
  Personal: [
    { key: "goal", question: "What outcome would make this feel solved?" },
    { key: "context", question: "Any relevant details about your situation?" },
    { key: "constraints", question: "Any preferences or things you've already tried?" },
    { key: "audience", question: "Is this just for you, or does it involve others?" },
  ],
};

/**
 * Get the best questions for a given input and use case.
 * Prioritizes use-case-specific questions, then fills with generic ones
 * for any missing aspects not already covered.
 */
function selectQuestions(
  text: string,
  useCase: string,
  missingAspects: string[],
): { key: string; question: string }[] {
  const questions: { key: string; question: string }[] = [];
  const usedKeys = new Set<string>();

  // Start with use-case-specific questions (up to 3)
  const specific = USECASE_QUESTIONS[useCase];
  if (specific) {
    for (const q of specific) {
      if (questions.length >= 3) break;
      // Skip if the user's input already covers this aspect
      if (q.key === "language" && /\b(python|javascript|typescript|react|swift|java|go|rust|node|css|html|sql|c\+\+|ruby|php)\b/i.test(text)) continue;
      if (q.key === "servings" && /\b(for \d|serves \d|\d people|\d persons)\b/i.test(text)) continue;
      if (q.key === "level" && /\b(beginner|intermediate|advanced|intro|ap |college|graduate|high school)\b/i.test(text)) continue;
      if (q.key === "subject" && wordCount(text) > 15) continue; // probably already described it
      questions.push(q);
      usedKeys.add(q.key);
    }
  }

  // Fill remaining slots with generic questions for missing aspects
  const genericPriorities = ["audience", "goal", "context", "constraints"] as const;
  for (const aspect of genericPriorities) {
    if (questions.length >= 4) break;
    if (usedKeys.has(aspect)) continue;
    if (missingAspects.includes(aspect)) {
      questions.push(GENERIC_QUESTIONS[aspect]);
      usedKeys.add(aspect);
    }
  }

  return questions;
}

export function analyzeInput(text: string, useCase?: string): VaguenessResult {
  const words = wordCount(text);
  const missingAspects = detectMissingAspects(text);

  const isVague =
    words < 10 ||
    !hasSpecificSubjectAndAction(text) ||
    hasOnlyGenericVerbs(text) ||
    (missingAspects.length > 0 && words < 20);

  // Always generate questions — even non-vague input benefits from
  // targeted follow-ups. The UI can still let users skip.
  const questions = selectQuestions(text, useCase || "Personal", missingAspects);

  // Show clarification if input is vague OR if we have good
  // use-case-specific questions to ask (even for specific input)
  const shouldClarify = isVague || questions.length >= 2;

  return { isVague: shouldClarify, missingAspects, questions };
}
