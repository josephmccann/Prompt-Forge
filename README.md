# PromptForger

Turn vague ideas into powerful, structured AI prompts.

PromptForger is a client-side web app that helps you create high-quality prompts for AI tools like ChatGPT, Claude, and Gemini. Describe what you need, answer a few targeted questions, and get three ready-to-use prompt variants — scored for clarity, specificity, and completeness.

All processing runs locally in your browser. No API keys, no accounts, no data leaves your device.

## Features

- **3 prompt variants** — Balanced (recommended), Concise, and Maximum Control
- **11 use cases** — Personal, Work, Writing, Research, Planning, Creative, Education, Coding, Cooking, General Intelligence, and Deep Research
- **Smart use-case-specific questions** — Each use case has its own targeted question bank (e.g., Coding asks about language and experience level, Education asks about grade level and assignment type). Skips questions you already answered in your input.
- **Post-generation refinement** — Type feedback like "make it more formal" or "add that it's a 5-page paper" and regenerate without starting over. Refinements stack across rounds.
- **Prompt quality scorecard** — Clarity, Specificity, Completeness, and Reliability scores with explanations
- **Few-shot examples** — Each generated prompt includes a concrete example so the AI sees the expected quality bar
- **Chain-of-thought reasoning** — Thorough depth prompts instruct the AI to outline its logic step by step
- **Self-verification** — Prompts end with a use-case-specific quality check the AI runs on its own output
- **Audience-aware tailoring** — When you specify an audience, the prompt explicitly tells the AI to adapt language and complexity
- **Positive constraint framing** — Constraints use positive instructions ("state uncertainty" not "don't guess") which research shows LLMs follow more reliably
- **Full history** — Browse, expand, and delete past generations (stored locally, 2 MB cap)
- **Copy shortcuts** — One-click copy for individual prompts or all three. Ctrl+Shift+C copies the best prompt from anywhere on the output screen
- **PWA / installable** — Add to your home screen on iOS or Android for a full-screen, offline-capable experience
- **Dark mode** — Teal accent on dark background, designed for comfortable extended use

## Use Cases

| Category | Role | What it does |
|---|---|---|
| Personal | Personal assistant | Practical everyday advice with clear next steps |
| Work | Professional consultant | Stakeholder-ready output with workplace-appropriate tone |
| Writing | Writer and editor | Clear voice, logical flow, engaging prose |
| Research | Research analyst | Evidence-based with source quality markers |
| Planning | Planning advisor | Timelines, milestones, risks, and contingencies |
| Creative | Creative director | Unexpected angles and multiple distinct directions |
| Education | Tutor and writing coach | Essay guidance with thesis development, study help that builds understanding without doing the work |
| Coding | Senior engineer and mentor | Working code with comments, edge cases, and design reasoning |
| Cooking | Professional chef | Exact measurements, timing, visual cues, and dietary substitutions |
| General Intelligence | Knowledgeable generalist | Cross-discipline synthesis with balanced, multi-perspective answers |
| Deep Research | Academic researcher | Primary source tracing, methodology evaluation, consensus mapping, and open question flagging |

Each use case has its own: role assignment, constraints, quality standard, few-shot example, domain mapping, verification check, and targeted question bank.

## Smart Clarification

Instead of asking the same generic questions every time, PromptForger asks questions tailored to what you're doing:

| Use Case | Example Questions |
|---|---|
| Education | Grade level, subject/assignment, requirements (word count, citation style), understanding vs. writing help |
| Coding | Language/framework, what you're building, experience level, constraints (no libraries, browser-only, etc.) |
| Cooking | How many people, dietary needs, skill level, equipment/time constraints |
| Deep Research | Scope (single study vs. lit review), field, purpose, source preferences (peer-reviewed, recent) |
| Work | Who will see it, goal (approve, inform, persuade), industry context, format requirements |
| Creative | Who it's for, vibe/direction, brand boundaries, examples they like |

Questions are skipped if you already answered them in your input text.

## Tech Stack

- **React 19** + **TypeScript 5.9** + **Vite 7**
- **Tailwind CSS 4** (dark mode, teal accent)
- **Zero external API calls** — all prompt generation is deterministic and template-based
- **PWA** — service worker + web app manifest for offline use and home screen install
- **Capacitor** — iOS App Store wrapper ready (optional)

## Getting Started

```bash
# Install dependencies (requires pnpm)
pnpm install

# Start the dev server
pnpm --filter @workspace/promptforger run dev

# Typecheck
pnpm --filter @workspace/promptforger run typecheck

# Production build
pnpm --filter @workspace/promptforger run build
```

The app runs at the port specified by the `PORT` environment variable.

## Project Structure

```
artifacts/promptforge/
  src/
    components/
      Header.tsx              # Navigation bar
      InputForm.tsx            # Main prompt input with use case, tone, depth selectors
      ClarificationForm.tsx    # Smart follow-up questions (use-case-specific)
      PromptOutput.tsx         # 3 prompt variants + scorecard + refinement input
      HistoryPanel.tsx         # Browse and manage past generations
      Paywall.tsx              # Subscription paywall (disabled for testing)
      LegalPage.tsx            # Privacy Policy and Terms of Service
    lib/
      promptBuilder.ts         # Template-based prompt generation engine
      clarificationEngine.ts   # Use-case-specific question selection and vagueness detection
      scoringEngine.ts         # Deterministic quality scoring
      storage.ts               # localStorage CRUD for history (2 MB cap)
      subscription.ts          # Subscription state management (StoreKit stubs ready)
      utils.ts                 # Clipboard utility and Tailwind helpers
    App.tsx                    # Screen state machine
    main.tsx                   # Entry point
    index.css                  # Theme, animations, safe area insets
  public/
    manifest.json              # PWA web app manifest
    sw.js                      # Service worker for offline caching
    favicon.svg                # App icon (SVG)
    icon-192.png               # PWA icon 192x192
    icon-512.png               # PWA icon 512x512
  capacitor.config.ts          # iOS App Store wrapper config
  APP_STORE_CHECKLIST.md       # Step-by-step App Store submission guide
```

## How It Works

1. **Input** — Describe your task in plain language and pick a use case, tone, and depth
2. **Clarification** — PromptForger asks up to 4 targeted questions specific to your use case. Questions are skipped if your input already covers them. You can always skip this step entirely.
3. **Generation** — Three prompt variants are built from templates that include:
   - Role assignment matched to your use case
   - Domain detection from your input keywords
   - Few-shot examples for the AI to calibrate against
   - Chain-of-thought instructions (at Thorough depth)
   - Constraints framed as positive instructions
   - A self-verification step tailored to the use case
   - All your clarification answers woven into the context
4. **Scoring** — Each prompt is scored on Clarity, Specificity, Completeness, and Reliability based on the detail you provided
5. **Refinement** — Type feedback in the "Refine Your Prompt" input to tweak the result (e.g., "make it more formal" or "focus on the financial aspects"). Refinements stack across rounds. You can also use "Make Shorter" or "Make More Detailed" for quick adjustments.

## Install as App

**iPhone / iPad:**
1. Open the site in Safari
2. Tap the Share button
3. Tap "Add to Home Screen"

**Android:**
1. Open the site in Chrome
2. Tap "Add to Home Screen" when prompted (or menu > "Install app")

The app works offline after the first visit.

## App Store

Infrastructure for Apple App Store submission is included but optional. See `APP_STORE_CHECKLIST.md` for the full submission guide, including subscription setup, icon requirements, and review notes.

## License

MIT
