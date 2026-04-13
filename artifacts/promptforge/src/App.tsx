import { useState, useEffect } from "react";
import { isAuthenticated } from "@/lib/auth";
import { analyzeInput } from "@/lib/clarificationEngine";
import { buildPrompts } from "@/lib/promptBuilder";
import { scorePrompt, generateExplanation } from "@/lib/scoringEngine";
import { addToHistory, generateId } from "@/lib/storage";
import type { GeneratedPrompts } from "@/lib/promptBuilder";
import type { Scores, ScoreExplanation } from "@/lib/scoringEngine";

import PasswordGate from "@/components/PasswordGate";
import Header from "@/components/Header";
import InputForm from "@/components/InputForm";
import ClarificationForm from "@/components/ClarificationForm";
import PromptOutput from "@/components/PromptOutput";
import HistoryPanel from "@/components/HistoryPanel";

type Screen = "password" | "input" | "clarification" | "output" | "history";

interface FormData {
  input: string;
  useCase: string;
  tone: string;
  depth: string;
}

function App() {
  const [screen, setScreen] = useState<Screen>(
    isAuthenticated() ? "input" : "password",
  );
  const [formData, setFormData] = useState<FormData | null>(null);
  const [clarificationQuestions, setClarificationQuestions] = useState<
    { key: string; question: string }[]
  >([]);
  const [clarificationAnswers, setClarificationAnswers] = useState<
    Record<string, string>
  >({});
  const [prompts, setPrompts] = useState<GeneratedPrompts | null>(null);
  const [scores, setScores] = useState<Scores | null>(null);
  const [explanation, setExplanation] = useState<ScoreExplanation | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [screen]);

  const handleAuthenticated = () => setScreen("input");
  const handleLogout = () => setScreen("password");

  const generateAndShow = (data: FormData, answers: Record<string, string>) => {
    const input = {
      originalInput: data.input,
      useCase: data.useCase,
      tone: data.tone,
      depth: data.depth,
      clarificationAnswers: answers,
    };

    const generated = buildPrompts(input);
    const scored = scorePrompt(generated.balanced, data.input, answers, data.depth);
    const explained = generateExplanation(data.input, answers, scored, data.depth);

    setPrompts(generated);
    setScores(scored);
    setExplanation(explained);
    setClarificationAnswers(answers);

    addToHistory({
      id: generateId(),
      timestamp: Date.now(),
      originalInput: data.input,
      useCase: data.useCase,
      tone: data.tone,
      depth: data.depth,
      clarificationAnswers: answers,
      generatedPrompts: generated,
      scores: scored,
    });

    setScreen("output");
  };

  const handleInputSubmit = (data: FormData) => {
    setFormData(data);
    const analysis = analyzeInput(data.input);

    if (analysis.isVague) {
      setClarificationQuestions(analysis.questions);
      setScreen("clarification");
    } else {
      generateAndShow(data, {});
    }
  };

  const handleClarificationSubmit = (answers: Record<string, string>) => {
    if (formData) {
      generateAndShow(formData, answers);
    }
  };

  const handleClarificationSkip = () => {
    if (formData) {
      generateAndShow(formData, {});
    }
  };

  const handleStartOver = () => {
    setFormData(null);
    setPrompts(null);
    setScores(null);
    setExplanation(null);
    setClarificationAnswers({});
    setScreen("input");
  };

  const handleMakeShorter = () => {
    if (formData) {
      generateAndShow(
        { ...formData, depth: "Quick", tone: "Simple" },
        clarificationAnswers,
      );
    }
  };

  const handleMakeDetailed = () => {
    if (formData) {
      generateAndShow(
        { ...formData, depth: "Thorough" },
        clarificationAnswers,
      );
    }
  };

  if (screen === "password") {
    return <PasswordGate onAuthenticated={handleAuthenticated} />;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Header
        onLogout={handleLogout}
        onHistoryClick={() =>
          setScreen(screen === "history" ? "input" : "history")
        }
        showHistory={screen !== "history"}
      />

      <main className="transition-opacity duration-300">
        {screen === "input" && <InputForm onSubmit={handleInputSubmit} />}

        {screen === "clarification" && (
          <ClarificationForm
            questions={clarificationQuestions}
            onSubmit={handleClarificationSubmit}
            onSkip={handleClarificationSkip}
          />
        )}

        {screen === "output" && prompts && scores && explanation && (
          <PromptOutput
            prompts={prompts}
            scores={scores}
            explanation={explanation}
            onStartOver={handleStartOver}
            onMakeShorter={handleMakeShorter}
            onMakeDetailed={handleMakeDetailed}
          />
        )}

        {screen === "history" && (
          <HistoryPanel onBack={() => setScreen("input")} />
        )}
      </main>
    </div>
  );
}

export default App;
