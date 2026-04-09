const GENERIC_VERBS = ["help", "write", "make", "create", "plan", "explain", "do", "fix", "build"];

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
  const hasSubject = /\b(email|letter|report|essay|code|plan|presentation|resume|article|blog|story|proposal|script|document|schedule|budget|website|app|database|marketing|sales|product|project|strategy|analysis|review|summary|outline|list|guide|tutorial|recipe|speech|cover letter|business plan|social media|content|campaign|pitch|portfolio|contract|invoice|announcement|memo|newsletter|press release|white paper|case study|survey|feedback|agenda|minutes|policy|procedure|manual|handbook|curriculum|syllabus|lesson|worksheet|quiz|test|exam)\b/.test(lower);
  const hasAction = /\b(write|draft|create|design|develop|analyze|review|edit|improve|optimize|organize|structure|format|summarize|research|compare|evaluate|implement|configure|set up|build|plan|schedule|prepare|compose|generate|produce|craft|revise|proofread|translate|convert|calculate|estimate|forecast|present|explain|describe|illustrate|outline|define|clarify|simplify|elaborate|expand|condense|rewrite|refactor|debug|test|deploy|monitor|track|manage|coordinate|facilitate|negotiate|persuade|recommend|advise|mentor|teach|train|assess|diagnose|troubleshoot|resolve|investigate|audit|document|archive|catalog|classify|prioritize|delegate|automate|integrate|migrate|upgrade|customize|personalize|localize|monetize|market|advertise|promote|brand|launch|pitch|sell|recruit|interview|onboard|motivate|incentivize)\b/.test(lower);
  return hasSubject && hasAction;
}

function hasOnlyGenericVerbs(text: string): boolean {
  const lower = text.toLowerCase();
  const words = lower.split(/\s+/);
  const verbsFound = words.filter((w) => GENERIC_VERBS.includes(w));
  if (verbsFound.length === 0) return false;
  const hasSpecifics = /\b(email|letter|report|essay|code|plan|presentation|resume|article|blog|story|proposal|marketing|sales|cover letter|business|budget|website|app|schedule|analysis|review|summary|recipe|speech)\b/.test(lower);
  return !hasSpecifics;
}

function detectMissingAspects(text: string): string[] {
  const lower = text.toLowerCase();
  const missing: string[] = [];

  const audiencePatterns = /\b(for my|for the|for a|audience|reader|client|boss|manager|team|student|customer|user|viewer|listener|stakeholder|investor|board|committee|colleague|coworker|friend|family|child|parent|teacher|professor|recruiter|hiring manager|interviewer|employee|vendor|partner|subscriber|follower|member|patient|doctor|lawyer|accountant|engineer|designer|developer|marketer|analyst|consultant|advisor|mentor)\b/;
  if (!audiencePatterns.test(lower)) {
    missing.push("audience");
  }

  const goalPatterns = /\b(goal|objective|aim|purpose|outcome|result|achieve|accomplish|want to|need to|trying to|looking to|hoping to|in order to|so that|to get|to make|to improve|to increase|to reduce|to solve|to find|to learn|to understand|to convince|to persuade|to inform|to educate|to entertain|to inspire|to motivate)\b/;
  if (!goalPatterns.test(lower)) {
    missing.push("goal");
  }

  const constraintPatterns = /\b(must|should|cannot|can't|don't|avoid|limit|require|constraint|restriction|deadline|budget|word count|page|format|style|tone|length|maximum|minimum|within|no more than|at least|excluding|including|except|only|specifically|exactly|precisely)\b/;
  if (!constraintPatterns.test(lower)) {
    missing.push("constraints");
  }

  const contextPatterns = /\b(because|since|context|background|situation|scenario|industry|field|domain|company|organization|project|currently|previously|already|existing|based on|given that|considering|in the context of|working on|dealing with|facing|experiencing|regarding|about the|related to|concerning|pertaining to|with respect to|in relation to)\b/;
  if (!contextPatterns.test(lower)) {
    missing.push("context");
  }

  const formatPatterns = /\b(format|structure|layout|template|bullet|list|paragraph|section|heading|table|chart|graph|diagram|slide|page|document|email|memo|report|essay|outline|summary|step.by.step|numbered|ordered|unordered|markdown|html|json|csv|pdf|presentation|spreadsheet|infographic|poster|brochure|flyer|banner|social media post|tweet|caption|headline|tagline|title|subtitle|abstract|introduction|conclusion|appendix|bibliography|reference|citation|footnote|endnote)\b/;
  if (!formatPatterns.test(lower)) {
    missing.push("format");
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
  tone: {
    key: "tone",
    question: "What tone do you want? (casual, formal, persuasive, friendly)",
  },
  constraints: {
    key: "constraints",
    question: "Any specific requirements or things to avoid?",
  },
  context: {
    key: "context",
    question: "Any background info that would help? (industry, topic area, situation)",
  },
  format: {
    key: "format",
    question: "What format do you want the output in? (email, list, essay, code, plan)",
  },
};

export function analyzeInput(text: string): VaguenessResult {
  const words = wordCount(text);
  const missingAspects = detectMissingAspects(text);

  const isTooShort = words < 10;
  const lacksSubjectAction = !hasSpecificSubjectAndAction(text);
  const onlyGeneric = hasOnlyGenericVerbs(text);
  const missingContextShort = missingAspects.length > 0 && words < 20;

  const isVague =
    isTooShort || lacksSubjectAction || onlyGeneric || missingContextShort;

  const questionsToAsk: { key: string; question: string }[] = [];

  const priorities = ["audience", "goal", "context", "constraints", "format", "tone"];
  for (const aspect of priorities) {
    if (missingAspects.includes(aspect) && questionsToAsk.length < 4) {
      questionsToAsk.push(QUESTION_BANK[aspect]);
    }
  }

  if (questionsToAsk.length < 2) {
    for (const aspect of priorities) {
      if (!missingAspects.includes(aspect) && questionsToAsk.length < 2) {
        questionsToAsk.push(QUESTION_BANK[aspect]);
      }
    }
  }

  return {
    isVague,
    missingAspects,
    questions: questionsToAsk,
  };
}
