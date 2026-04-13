# PromptForger — Apple App Store Submission Checklist

## Pre-submission (done in code)

- [x] Capacitor config (`capacitor.config.ts`) with bundle ID `com.promptforger.app`
- [x] Subscription paywall with Apple-required disclosures
  - [x] Price and billing period displayed
  - [x] Free trial terms disclosed
  - [x] Auto-renewal terms disclosed
  - [x] Cancellation instructions included
  - [x] "Restore Purchases" button
- [x] Privacy Policy page (in-app)
- [x] Terms of Service page (in-app)
- [x] iOS meta tags (status bar, theme color, viewport-fit=cover)
- [x] Safe area insets for notch/home indicator
- [x] Accessibility: aria labels on interactive elements
- [x] No external data collection (all processing is on-device)

## Requires Xcode / Apple Developer Account

- [ ] **Apple Developer Program** — Enroll at developer.apple.com ($99/year)
- [ ] **Install Capacitor iOS platform**:
  ```bash
  cd artifacts/promptforge
  npx cap add ios
  npx cap sync
  ```
- [ ] **App Icons** — Provide a 1024x1024 PNG (no alpha/transparency).
  Xcode will generate all required sizes. Place in `ios/App/App/Assets.xcassets/AppIcon.appiconset/`
- [ ] **Launch Screen** — Configure in `ios/App/App/Base.lproj/LaunchScreen.storyboard`.
  Use solid `#0a0a0a` background with the PromptForger logo centered.
- [ ] **Signing** — In Xcode > Signing & Capabilities, select your team and
  enable "Automatically manage signing"
- [ ] **In-App Purchase setup**:
  1. In App Store Connect, create a new auto-renewable subscription group "PromptForger Pro"
  2. Add a subscription product:
     - Product ID: `com.promptforger.app.monthly`
     - Price: $1.99/month (Tier 2)
     - Free trial: 7 days
  3. Wire StoreKit in code:
     ```bash
     npm install @capacitor-community/in-app-purchases
     npx cap sync
     ```
  4. Replace the TODO stubs in `src/lib/subscription.ts` and `src/components/Paywall.tsx`

## App Store Connect Metadata

- [ ] **App Name**: PromptForger
- [ ] **Subtitle**: Turn ideas into powerful AI prompts
- [ ] **Category**: Productivity
- [ ] **Description** (suggested):
  > PromptForger helps you turn vague ideas into structured, high-quality
  > prompts for AI tools like ChatGPT, Claude, and Gemini. Just describe what
  > you need, answer a few optional questions, and get three ready-to-use
  > prompt variants — scored for clarity, specificity, and completeness.
  >
  > Features:
  > - 3 prompt variants: Balanced, Concise, and Maximum Control
  > - Prompt quality scorecard with detailed scoring
  > - Intelligent follow-up questions to strengthen your prompt
  > - Few-shot examples and chain-of-thought reasoning built in
  > - Full prompt history
  > - Works offline — all processing happens on your device
  >
  > No AI API keys needed. No data leaves your device.

- [ ] **Keywords**: prompt, AI, ChatGPT, Claude, Gemini, prompt engineering, writing, productivity
- [ ] **Screenshots**: 6.7" (iPhone 15 Pro Max) and 6.1" (iPhone 15 Pro) required minimum
- [ ] **Age Rating**: 4+ (no objectionable content)
- [ ] **Privacy URL**: Host Privacy Policy at a public URL (e.g., promptforger.com/privacy)
- [ ] **Support URL**: e.g., promptforger.com/support or a mailto: link

## Subscription Review Notes for Apple

Include in the "Notes for Review" field:

> This app uses an auto-renewable subscription ($1.99/month with 7-day free trial).
> The subscription unlocks unlimited prompt generation, history, and new templates.
> All prompt processing runs on-device with no external API calls.
> No account creation is required.
> Test account: not applicable (no server-side auth).

## Post-submission

- [ ] Monitor App Store Connect for review status
- [ ] Respond to any review feedback within 24 hours
- [ ] Prepare 1.1 update with cloud history sync (justifies recurring subscription)
