/**
 * Subscription state management for PromptForger.
 *
 * In production iOS builds this will be backed by the
 * @capacitor-community/in-app-purchases plugin (StoreKit 2).
 * For now it uses localStorage so the paywall UI can be developed
 * and tested before the native layer is wired up.
 *
 * Apple App Store subscription requirements implemented here:
 *  - Subscription status checking
 *  - Restore purchases flow
 *  - Subscription metadata (price, period, terms)
 */

const SUB_KEY = "promptforger_subscription";

export const SUBSCRIPTION = {
  productId: "com.promptforger.app.monthly",
  price: "$1.99",
  period: "month",
  trialDays: 7,
  // Apple takes 30% year 1, 15% year 2+
  description: "Unlimited prompt generation, history sync, and new templates",
} as const;

export interface SubscriptionState {
  isActive: boolean;
  expiresAt: number | null; // Unix ms
  productId: string | null;
  source: "storekit" | "local"; // "storekit" once real IAP is wired
}

function defaultState(): SubscriptionState {
  return { isActive: false, expiresAt: null, productId: null, source: "local" };
}

export function getSubscription(): SubscriptionState {
  try {
    const raw = localStorage.getItem(SUB_KEY);
    if (!raw) return defaultState();
    const state = JSON.parse(raw) as SubscriptionState;
    // Auto-expire if past expiration
    if (state.expiresAt && Date.now() > state.expiresAt) {
      return { ...state, isActive: false };
    }
    return state;
  } catch {
    return defaultState();
  }
}

export function isSubscribed(): boolean {
  return getSubscription().isActive;
}

/**
 * Activate subscription. In production this is called after StoreKit
 * confirms a successful purchase. During development it activates
 * immediately with a 30-day window.
 */
export function activateSubscription(): void {
  const state: SubscriptionState = {
    isActive: true,
    expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
    productId: SUBSCRIPTION.productId,
    source: "local",
  };
  localStorage.setItem(SUB_KEY, JSON.stringify(state));
}

/**
 * Restore purchases. On iOS this triggers StoreKit's restoreCompletedTransactions.
 * Returns true if a valid subscription was found.
 */
export async function restorePurchases(): Promise<boolean> {
  // TODO: Wire to Capacitor IAP plugin:
  // const { InAppPurchase2 } = await import("@capacitor-community/in-app-purchases");
  // const result = await InAppPurchase2.restorePurchases();
  // ... validate receipts ...

  // For now, check local state
  const state = getSubscription();
  return state.isActive;
}

export function clearSubscription(): void {
  localStorage.removeItem(SUB_KEY);
}
