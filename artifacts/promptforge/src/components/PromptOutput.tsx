import { useState, useEffect, useRef } from "react";
import { Copy, Check, Star, ArrowLeft, Minimize2, Maximize2, RefreshCw } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";
import type { GeneratedPrompts } from "@/lib/promptBuilder";
import type { Scores, ScoreExplanation } from "@/lib/scoringEngine";

interface PromptOutputProps {
  prompts: GeneratedPrompts;
  scores: Scores;
  explanation: ScoreExplanation;
  onStartOver: () => void;
  onMakeShorter: () => void;
  onMakeDetailed: () => void;
  onRefine: (feedback: string) => void;
}

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await copyToClipboard(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white"
    >
      {copied ? (
        <>
          <Check className="w-3.5 h-3.5 text-green-400" />
          <span className="text-green-400">Copied!</span>
        </>
      ) : (
        <>
          <Copy className="w-3.5 h-3.5" />
          {label}
        </>
      )}
    </button>
  );
}

function ScoreBar({
  label,
  score,
  delay,
}: {
  label: string;
  score: number;
  delay: number;
}) {
  const [width, setWidth] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setWidth((score / 10) * 100), delay);
    return () => clearTimeout(timer);
  }, [score, delay]);

  const color =
    score >= 8
      ? "bg-green-500"
      : score >= 5
        ? "bg-yellow-500"
        : score >= 3
          ? "bg-orange-500"
          : "bg-red-500";

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-zinc-400 w-28 shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden" ref={ref}>
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${color}`}
          style={{ width: `${width}%` }}
        />
      </div>
      <span className="text-sm font-mono text-zinc-300 w-8 text-right">
        {score}
      </span>
    </div>
  );
}

function PromptCard({
  title,
  prompt,
  recommended,
}: {
  title: string;
  prompt: string;
  recommended?: boolean;
}) {
  return (
    <div
      className={`bg-[#161616] border rounded-2xl p-5 flex flex-col ${
        recommended ? "border-teal-500/30" : "border-white/[0.06]"
      }`}
    >
      <div className="flex items-center gap-2 mb-3">
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        {recommended && (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-400 text-xs font-medium border border-teal-500/20">
            <Star className="w-3 h-3" />
            Recommended
          </span>
        )}
      </div>
      <div className="flex-1 overflow-auto max-h-80 mb-3 rounded-lg bg-black/30 p-4">
        <pre className="text-sm text-zinc-300 font-mono whitespace-pre-wrap break-words leading-relaxed">{prompt}</pre>
      </div>
      <CopyButton text={prompt} label="Copy" />
    </div>
  );
}

export default function PromptOutput({
  prompts,
  scores,
  explanation,
  onStartOver,
  onMakeShorter,
  onMakeDetailed,
  onRefine,
}: PromptOutputProps) {
  const [toast, setToast] = useState("");
  const [refineInput, setRefineInput] = useState("");

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "C") {
        e.preventDefault();
        copyToClipboard(prompts.balanced).then(() => {
          setToast("Best prompt copied! (Ctrl+Shift+C)");
          setTimeout(() => setToast(""), 2500);
        });
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [prompts.balanced]);

  const copyAll = async () => {
    const text = `=== BALANCED (Recommended) ===\n\n${prompts.balanced}\n\n=== CONCISE ===\n\n${prompts.concise}\n\n=== MAXIMUM CONTROL ===\n\n${prompts.maxControl}`;
    await copyToClipboard(text);
    setToast("All three prompts copied!");
    setTimeout(() => setToast(""), 2500);
  };

  const copyBest = async () => {
    await copyToClipboard(prompts.balanced);
    setToast("Best prompt copied!");
    setTimeout(() => setToast(""), 2500);
  };

  return (
    <div className="px-4 py-8 sm:py-12 max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        <PromptCard title="Balanced" prompt={prompts.balanced} recommended />
        <PromptCard title="Concise" prompt={prompts.concise} />
        <PromptCard title="Maximum Control" prompt={prompts.maxControl} />
      </div>

      <div className="bg-[#161616] border border-white/[0.06] rounded-2xl p-6 mb-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          Prompt Scorecard
        </h3>
        <div className="space-y-3">
          <ScoreBar label="Clarity" score={scores.clarity} delay={100} />
          <ScoreBar label="Specificity" score={scores.specificity} delay={200} />
          <ScoreBar label="Completeness" score={scores.completeness} delay={300} />
          <ScoreBar label="Reliability" score={scores.reliability} delay={400} />
        </div>
      </div>

      <div className="bg-[#161616] border border-white/[0.06] rounded-2xl p-6 mb-8">
        <h3 className="text-lg font-semibold text-white mb-3">
          Why This Is Better
        </h3>
        <ul className="space-y-2">
          {explanation.bullets.map((bullet, i) => (
            <li
              key={i}
              className="flex items-start gap-2 text-sm text-zinc-400"
            >
              <span className="text-teal-400 mt-0.5 shrink-0">-</span>
              {bullet}
            </li>
          ))}
        </ul>
      </div>

      {/* Refinement input */}
      <div className="bg-[#161616] border border-white/[0.06] rounded-2xl p-6 mb-8">
        <h3 className="text-lg font-semibold text-white mb-2">
          Refine Your Prompt
        </h3>
        <p className="text-sm text-zinc-500 mb-4">
          Want to tweak the result? Describe what to change and we'll regenerate.
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (refineInput.trim()) {
              onRefine(refineInput.trim());
              setRefineInput("");
            }
          }}
          className="flex gap-3"
        >
          <input
            type="text"
            value={refineInput}
            onChange={(e) => setRefineInput(e.target.value)}
            placeholder={"e.g., \"make it more formal\" or \"add that it's a 5-page paper\""}
            className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-teal-500/40 transition-all text-sm"
            aria-label="Describe how to refine the prompt"
          />
          <button
            type="submit"
            disabled={!refineInput.trim()}
            className="px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 disabled:opacity-40 disabled:cursor-not-allowed text-black font-semibold transition-all flex items-center gap-2 text-sm shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
            Refine
          </button>
        </form>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={copyBest}
          className="px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-black font-semibold transition-all hover:scale-[1.01] active:scale-[0.99]"
          title="Ctrl+Shift+C"
        >
          Copy Best Prompt
        </button>
        <button
          onClick={copyAll}
          className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10 font-medium transition-all"
        >
          Copy All Three
        </button>
        <button
          onClick={onStartOver}
          className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10 font-medium transition-all flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Start Over
        </button>
        <button
          onClick={onMakeShorter}
          className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10 font-medium transition-all flex items-center gap-2"
        >
          <Minimize2 className="w-4 h-4" />
          Make Shorter
        </button>
        <button
          onClick={onMakeDetailed}
          className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10 font-medium transition-all flex items-center gap-2"
        >
          <Maximize2 className="w-4 h-4" />
          Make More Detailed
        </button>
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-2.5 rounded-xl bg-teal-500 text-black font-medium text-sm shadow-lg shadow-teal-500/20 animate-fade-in z-50">
          {toast}
        </div>
      )}
    </div>
  );
}
