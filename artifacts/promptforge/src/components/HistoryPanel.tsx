import { useState } from "react";
import { ArrowLeft, ChevronDown, ChevronUp, Trash2, Trash } from "lucide-react";
import { getHistory, deleteFromHistory, clearHistory } from "@/lib/storage";
import type { HistoryEntry } from "@/lib/storage";

interface HistoryPanelProps {
  onBack: () => void;
}

function timeAgo(ts: number): string {
  const seconds = Math.floor((Date.now() - ts) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(ts).toLocaleDateString();
}

function HistoryCard({ entry, onDelete }: { entry: HistoryEntry; onDelete: () => void }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-[#161616] border border-white/[0.06] rounded-xl p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-zinc-500">{timeAgo(entry.timestamp)}</span>
            <span className="px-2 py-0.5 rounded-full bg-white/5 text-xs text-zinc-400 border border-white/5">
              {entry.useCase}
            </span>
          </div>
          <p className="text-sm text-zinc-300 truncate">
            {entry.originalInput.slice(0, 80)}
            {entry.originalInput.length > 80 ? "..." : ""}
          </p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-white/5 transition-colors"
          >
            {expanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="mt-4 pt-4 border-t border-white/5">
          <div className="flex gap-3 mb-3 text-xs text-zinc-500">
            <span>Clarity: {entry.scores.clarity}/10</span>
            <span>Specificity: {entry.scores.specificity}/10</span>
            <span>Completeness: {entry.scores.completeness}/10</span>
            <span>Reliability: {entry.scores.reliability}/10</span>
          </div>
          <div className="rounded-lg bg-black/30 p-4 overflow-auto max-h-60">
            <pre className="text-xs text-zinc-400 font-mono whitespace-pre-wrap break-words leading-relaxed">{entry.generatedPrompts.balanced}</pre>
          </div>
        </div>
      )}
    </div>
  );
}

export default function HistoryPanel({ onBack }: HistoryPanelProps) {
  const [history, setHistory] = useState(getHistory);

  const handleDelete = (id: string) => {
    deleteFromHistory(id);
    setHistory(getHistory());
  };

  const handleClearAll = () => {
    clearHistory();
    setHistory([]);
  };

  return (
    <div className="min-h-[calc(100vh-56px)] px-4 py-8 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onBack}
          className="p-2 rounded-lg text-zinc-500 hover:text-white hover:bg-white/5 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-bold text-white">History</h2>
      </div>

      {history.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-zinc-500 text-sm">No history yet. Create your first prompt to get started.</p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {history.map((entry) => (
              <HistoryCard
                key={entry.id}
                entry={entry}
                onDelete={() => handleDelete(entry.id)}
              />
            ))}
          </div>
          <div className="mt-6 text-center">
            <button
              onClick={handleClearAll}
              className="px-4 py-2 rounded-xl text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors flex items-center gap-2 mx-auto"
            >
              <Trash className="w-4 h-4" />
              Clear All History
            </button>
          </div>
        </>
      )}
    </div>
  );
}
