import { useState } from "react";
import { ArrowRight, SkipForward } from "lucide-react";

interface ClarificationFormProps {
  questions: { key: string; question: string }[];
  onSubmit: (answers: Record<string, string>) => void;
  onSkip: () => void;
}

export default function ClarificationForm({
  questions,
  onSubmit,
  onSkip,
}: ClarificationFormProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const handleChange = (key: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(answers);
  };

  return (
    <div className="min-h-[calc(100vh-56px)] flex items-start sm:items-center justify-center px-4 py-8 sm:py-12">
      <div className="w-full max-w-2xl">
        <div className="bg-[#161616] border border-white/[0.06] rounded-2xl p-6 sm:p-8">
          <h2 className="text-xl font-bold text-white mb-1">
            A few quick questions to make your prompt stronger
          </h2>
          <p className="text-sm text-zinc-500 mb-6">
            Answer what you can — everything is optional.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {questions.map((q) => (
              <div key={q.key}>
                <label className="text-sm font-medium text-zinc-300 mb-2 block">
                  {q.question}
                </label>
                <input
                  type="text"
                  value={answers[q.key] || ""}
                  onChange={(e) => handleChange(q.key, e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-teal-500/40 transition-all"
                  placeholder="Type your answer..."
                />
              </div>
            ))}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="submit"
                className="flex-1 px-4 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-black font-semibold transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
              >
                Generate Prompt
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={onSkip}
                className="px-4 py-3 rounded-xl text-zinc-400 hover:text-white transition-colors flex items-center justify-center gap-2"
              >
                <SkipForward className="w-4 h-4" />
                Skip — just generate
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
