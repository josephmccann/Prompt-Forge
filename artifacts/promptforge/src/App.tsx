import { useState, useEffect } from "react";
import { analyzeInput } from "@/lib/clarificationEngine";
import { buildPrompts } from "@/lib/promptBuilder";
import { scorePrompt, generateExplanation } from "@/lib/scoringEngine";
import { addToHistory, generateId } from "@/lib/storage";
import { isSubscribed } from "@/lib/subscription";
import type { GeneratedPrompts } from "@/lib/promptBuilder";
import type { Scores, ScoreExplanation } from "@/lib/scoringEngine";

import Header from "@/components/Header";
import InputForm from "@/components/InputForm";
import ClarificationForm from "@/components/ClarificationForm";
import PromptOutput from "@/components/PromptOutput";
import HistoryPanel from "@/components/HistoryPanel";
import Paywall from "@/components/Paywall";
import { PrivacyPolicy, TermsOfService } from "@/components/LegalPage";

type Screen =
  | "paywall"
  | "input"
  | "clarification"
  | "output"
  | "history"
  | "privacy"
  | "terms";

interface FormData {
  input: string;
  useCase: string;
  tone: string;
  depth: string;
}

function App() {
  // TODO: Re-enable paywall before App Store submission:
  // isSubscribed() ? "input" : "paywall"
  const [screen, setScreen] = useState<Screen>("input");
  const [prevScreen, setPrevScreen] = useState<Screen>("paywall");
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

  // Intercept /privacy and /terms hash routes for legal pages
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (href === "/privacy") {
        e.preventDefault();
        setPrevScreen(screen);
        setScreen("privacy");
      } else if (href === "/terms") {
        e.preventDefault();
        setPrevScreen(screen);
        setScreen("terms");
      }
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [screen]);

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

  if (screen === "privacy") {
    return <PrivacyPolicy onBack={() => setScreen(prevScreen)} />;
  }
  if (screen === "terms") {
    return <TermsOfService onBack={() => setScreen(prevScreen)} />;
  }
  if (screen === "paywall") {
    return <Paywall onSubscribed={() => setScreen("input")} />;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Header
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
