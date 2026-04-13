# PromptForger

Turn vague ideas into powerful, structured AI prompts.

PromptForger is a client-side web app that helps you create high-quality prompts for AI tools like ChatGPT, Claude, and Gemini. Describe what you need, answer a few optional questions, and get three ready-to-use prompt variants — scored for clarity, specificity, and completeness.

All processing runs locally in your browser. No API keys, no accounts, no data leaves your device.

## Features

- **3 prompt variants** — Balanced (recommended), Concise, and Maximum Control
- **Prompt quality scorecard** — Clarity, Specificity, Completeness, and Reliability scores with explanations
- **Smart follow-up questions** — Detects vague input and asks targeted questions to strengthen the prompt
- **Few-shot examples** — Each generated prompt includes a concrete example so the AI sees the expected quality bar
- **Chain-of-thought reasoning** — Thorough depth prompts instruct the AI to outline its logic step by step
- **Self-verification** — Prompts end with a use-case-specific quality check the AI runs on its own output
- **Audience-aware tailoring** — When you specify an audience, the prompt explicitly tells the AI to adapt language and complexity
- **Full history** — Browse, expand, and delete past generations (stored locally, 2 MB cap)
- **Copy shortcuts** — One-click copy for individual prompts or all three. Ctrl+Shift+C copies the best prompt from anywhere on the output screen
- **PWA / installable** — Add to your home screen on iOS or Android for a full-screen, offline-capable experience
- **Dark mode** — Teal accent on dark background, designed for comfortable extended use

## Use Cases

| Category | What it does |
|---|---|
| Personal | Practical everyday advice with clear next steps |
| Work | Professional, stakeholder-ready output |
| Writing | Clear voice, logical flow, engaging prose |
| Research | Evidence-based with source quality markers |
| Planning | Timelines, milestones, risks, and contingencies |
| Creative | Unexpected angles and multiple distinct directions |

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
      ClarificationForm.tsx    # Smart follow-up questions for vague input
      PromptOutput.tsx         # 3 prompt variants + scorecard + explanations
      HistoryPanel.tsx         # Browse and manage past generations
      Paywall.tsx              # Subscription paywall (disabled for testing)
      LegalPage.tsx            # Privacy Policy and Terms of Service
    lib/
      promptBuilder.ts         # Template-based prompt generation engine
      clarificationEngine.ts   # Vagueness detection and question selection
      scoringEngine.ts         # Deterministic quality scoring
      storage.ts               # localStorage CRUD for history
      subscription.ts          # Subscription state management
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

1. **Input** — You describe your task in plain language and pick a use case, tone, and depth
2. **Clarification** — If the input is vague, PromptForger asks up to 4 targeted questions (audience, goal, context, constraints)
3. **Generation** — Three prompt variants are built from templates that include:
   - Role assignment matched to your use case
   - Domain detection from your input keywords
   - Few-shot examples for the AI to calibrate against
   - Chain-of-thought instructions (at Thorough depth)
   - Constraints framed as positive instructions (research shows LLMs follow these more reliably than negations)
   - A self-verification step tailored to the use case
4. **Scoring** — Each prompt is scored on Clarity, Specificity, Completeness, and Reliability based on the detail you provided
5. **Refinement** — "Make Shorter" and "Make More Detailed" buttons regenerate with adjusted settings

## Install as App

**iPhone / iPad:**
1. Open the site in Safari
2. Tap the Share button
3. Tap "Add to Home Screen"

**Android:**
1. Open the site in Chrome
2. Tap "Add to Home Screen" when prompted (or menu > "Install app")

## App Store

Infrastructure for Apple App Store submission is included but optional. See `APP_STORE_CHECKLIST.md` for the full submission guide.

## License

MIT
