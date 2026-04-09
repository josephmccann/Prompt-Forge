const HISTORY_KEY = "promptforge_history";
const MAX_ENTRIES = 50;

export interface HistoryEntry {
  id: string;
  timestamp: number;
  originalInput: string;
  useCase: string;
  tone: string;
  depth: string;
  clarificationAnswers: Record<string, string>;
  generatedPrompts: {
    balanced: string;
    concise: string;
    maxControl: string;
  };
  scores: {
    clarity: number;
    specificity: number;
    completeness: number;
    reliability: number;
  };
}

export function getHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as HistoryEntry[];
  } catch {
    return [];
  }
}

export function addToHistory(entry: HistoryEntry): void {
  const history = getHistory();
  history.unshift(entry);
  if (history.length > MAX_ENTRIES) {
    history.length = MAX_ENTRIES;
  }
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

export function deleteFromHistory(id: string): void {
  const history = getHistory().filter((e) => e.id !== id);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

export function clearHistory(): void {
  localStorage.removeItem(HISTORY_KEY);
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
