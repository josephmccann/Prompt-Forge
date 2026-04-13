import { useState } from "react";
import { Sparkles, Check, RotateCcw } from "lucide-react";
import {
  SUBSCRIPTION,
  activateSubscription,
  restorePurchases,
} from "@/lib/subscription";

interface PaywallProps {
  onSubscribed: () => void;
}

const FEATURES = [
  "Unlimited prompt generation",
  "Full prompt history",
  "3 prompt variants (Balanced, Concise, Maximum Control)",
  "Prompt quality scorecard",
  "Few-shot examples & chain-of-thought",
  "New templates added regularly",
];

export default function Paywall({ onSubscribed }: PaywallProps) {
  const [restoring, setRestoring] = useState(false);
  const [restoreMessage, setRestoreMessage] = useState("");

  const handleSubscribe = async () => {
    // TODO: Replace with real StoreKit purchase flow:
    // import { InAppPurchase2 } from "@capacitor-community/in-app-purchases";
    // await InAppPurchase2.purchase({ productId: SUBSCRIPTION.productId });
    activateSubscription();
    onSubscribed();
  };

  const handleRestore = async () => {
    setRestoring(true);
    setRestoreMessage("");
    const found = await restorePurchases();
    if (found) {
      setRestoreMessage("Subscription restored!");
      setTimeout(() => onSubscribed(), 800);
    } else {
      setRestoreMessage("No active subscription found.");
    }
    setRestoring(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-7 h-7 text-teal-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">
            Prompt<span className="text-teal-400">Forger</span>
          </h1>
          <p className="text-sm text-zinc-500">
            Turn vague ideas into powerful AI prompts
          </p>
        </div>

        {/* Features */}
        <div className="bg-[#161616] border border-white/[0.06] rounded-2xl p-5 mb-6">
          <ul className="space-y-3" role="list">
            {FEATURES.map((feature) => (
              <li key={feature} className="flex items-start gap-2.5 text-sm text-zinc-300">
                <Check className="w-4 h-4 text-teal-400 mt-0.5 shrink-0" aria-hidden="true" />
                {feature}
              </li>
            ))}
          </ul>
        </div>

        {/* Price & trial */}
        <div className="text-center mb-4">
          <p className="text-3xl font-bold text-white">
            {SUBSCRIPTION.price}
            <span className="text-base font-normal text-zinc-500">
              /{SUBSCRIPTION.period}
            </span>
          </p>
          {SUBSCRIPTION.trialDays > 0 && (
            <p className="text-sm text-teal-400 mt-1">
              {SUBSCRIPTION.trialDays}-day free trial
            </p>
          )}
        </div>

        {/* Subscribe button */}
        <button
          onClick={handleSubscribe}
          className="w-full px-4 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-black font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
          aria-label={`Subscribe for ${SUBSCRIPTION.price} per ${SUBSCRIPTION.period}`}
        >
          Start Free Trial
        </button>

        {/* Restore purchases — required by Apple */}
        <button
          onClick={handleRestore}
          disabled={restoring}
          className="w-full mt-3 px-4 py-2.5 rounded-xl text-sm text-zinc-400 hover:text-white transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          aria-label="Restore previous purchases"
        >
          <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
          {restoring ? "Restoring..." : "Restore Purchases"}
        </button>

        {restoreMessage && (
          <p className="text-center text-sm text-zinc-400 mt-2" role="status">
            {restoreMessage}
          </p>
        )}

        {/* Apple-required subscription terms disclosure */}
        <div className="mt-6 text-center text-[11px] leading-relaxed text-zinc-600 space-y-1">
          <p>
            {SUBSCRIPTION.trialDays > 0
              ? `After the ${SUBSCRIPTION.trialDays}-day free trial, your subscription automatically renews at ${SUBSCRIPTION.price}/${SUBSCRIPTION.period} unless cancelled at least 24 hours before the end of the current period.`
              : `Subscription automatically renews at ${SUBSCRIPTION.price}/${SUBSCRIPTION.period} unless cancelled at least 24 hours before the end of the current period.`}
          </p>
          <p>
            Payment is charged to your Apple ID account at confirmation of purchase.
            You can manage or cancel your subscription in your device Settings &gt; Apple ID &gt; Subscriptions.
          </p>
          <p className="flex justify-center gap-3 pt-1">
            <a href="/privacy" className="underline hover:text-zinc-400">
              Privacy Policy
            </a>
            <a href="/terms" className="underline hover:text-zinc-400">
              Terms of Service
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
