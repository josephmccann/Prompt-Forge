import { useState, useRef, useEffect } from "react";
import { ArrowRight } from "lucide-react";

interface InputFormProps {
  onSubmit: (data: {
    input: string;
    useCase: string;
    tone: string;
    depth: string;
  }) => void;
}

const USE_CASES = ["Personal", "Work", "Writing", "Research", "Planning", "Creative"];
const TONES = ["Simple", "Professional", "Detailed", "Creative"];
const DEPTHS = ["Quick", "Standard", "Thorough"];

function PillGroup({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2 block">
        {label}
      </label>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              value === opt
                ? "bg-teal-500/20 text-teal-300 border border-teal-500/30"
                : "bg-white/5 text-zinc-400 border border-white/5 hover:border-white/15 hover:text-zinc-300"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function InputForm({ onSubmit }: InputFormProps) {
  const [input, setInput] = useState("");
  const [useCase, setUseCase] = useState("Personal");
  const [tone, setTone] = useState("Professional");
  const [depth, setDepth] = useState("Standard");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        Math.max(textareaRef.current.scrollHeight, 96) + "px";
    }
  }, [input]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSubmit({ input: input.trim(), useCase, tone, depth });
  };

  return (
    <div className="min-h-[calc(100vh-56px)] flex items-start sm:items-center justify-center px-4 py-8 sm:py-12">
      <div className="w-full max-w-2xl">
        <div className="bg-[#161616] border border-white/[0.06] rounded-2xl p-6 sm:p-8">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">
            What do you want help with?
          </h2>
          <p className="text-sm text-zinc-500 mb-6">
            Describe your task, question, or goal. We'll turn it into a prompt
            that gets great results.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g., Help me write a cover letter for a marketing job..."
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-teal-500/40 resize-none transition-all min-h-[96px]"
              rows={4}
            />

            <PillGroup
              label="Use case"
              options={USE_CASES}
              value={useCase}
              onChange={setUseCase}
            />
            <PillGroup
              label="Tone"
              options={TONES}
              value={tone}
              onChange={setTone}
            />
            <PillGroup
              label="Depth"
              options={DEPTHS}
              value={depth}
              onChange={setDepth}
            />

            <button
              type="submit"
              disabled={!input.trim()}
              className="w-full px-4 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 disabled:opacity-40 disabled:cursor-not-allowed text-black font-semibold transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
            >
              Improve My Prompt
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
