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

interface VaguenessResult {
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

const QUESTION_BANK: Record<string, { key: string; question: string }> = {
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

export function analyzeInput(text: string): VaguenessResult {
  const words = wordCount(text);
  const missingAspects = detectMissingAspects(text);

  const isVague =
    words < 10 ||
    !hasSpecificSubjectAndAction(text) ||
    hasOnlyGenericVerbs(text) ||
    (missingAspects.length > 0 && words < 20);

  const questions: { key: string; question: string }[] = [];
  const priorities = ["audience", "goal", "context", "constraints"] as const;

  for (const aspect of priorities) {
    if (missingAspects.includes(aspect) && questions.length < 4) {
      questions.push(QUESTION_BANK[aspect]);
    }
  }

  return { isVague, missingAspects, questions };
}
