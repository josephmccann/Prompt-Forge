import { ArrowLeft } from "lucide-react";

interface LegalPageProps {
  title: string;
  children: React.ReactNode;
  onBack: () => void;
}

export default function LegalPage({ title, children, onBack }: LegalPageProps) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-zinc-500 hover:text-white transition-colors mb-6"
          aria-label="Go back"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          Back
        </button>
        <h1 className="text-2xl font-bold text-white mb-6">{title}</h1>
        <div className="prose prose-invert prose-sm prose-zinc max-w-none [&_p]:text-zinc-400 [&_h2]:text-zinc-200 [&_h2]:text-lg [&_h2]:mt-6 [&_h2]:mb-3 [&_li]:text-zinc-400">
          {children}
        </div>
      </div>
    </div>
  );
}

export function PrivacyPolicy({ onBack }: { onBack: () => void }) {
  return (
    <LegalPage title="Privacy Policy" onBack={onBack}>
      <p><strong>Last updated:</strong> April 2026</p>

      <h2>What We Collect</h2>
      <p>
        PromptForger processes all prompt generation locally on your device.
        We do not collect, transmit, or store your prompts, input text, or
        generated output on any external server.
      </p>

      <h2>Data Stored on Your Device</h2>
      <p>
        Prompt history is stored in your device's local storage so you can
        review past generations. This data never leaves your device and can
        be cleared at any time from the History screen.
      </p>

      <h2>Subscription Data</h2>
      <p>
        If you subscribe, Apple processes and stores your payment
        information. We do not have access to your payment details.
        Subscription status is verified through Apple's StoreKit framework.
      </p>

      <h2>Analytics</h2>
      <p>
        We do not use third-party analytics, tracking pixels, or
        advertising SDKs. We do not sell or share your data with third
        parties.
      </p>

      <h2>Children's Privacy</h2>
      <p>
        PromptForger is not directed at children under 13. We do not
        knowingly collect information from children.
      </p>

      <h2>Changes</h2>
      <p>
        We may update this policy from time to time. Changes will be posted
        in the app and take effect immediately upon posting.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about this policy? Contact us at support@promptforger.com.
      </p>
    </LegalPage>
  );
}

export function TermsOfService({ onBack }: { onBack: () => void }) {
  return (
    <LegalPage title="Terms of Service" onBack={onBack}>
      <p><strong>Last updated:</strong> April 2026</p>

      <h2>Acceptance</h2>
      <p>
        By using PromptForger, you agree to these terms. If you do not
        agree, do not use the app.
      </p>

      <h2>Service Description</h2>
      <p>
        PromptForger is a tool that helps you create structured prompts for
        AI language models. All prompt generation runs locally on your
        device. We do not guarantee any specific outcome from prompts used
        with third-party AI services.
      </p>

      <h2>Subscriptions</h2>
      <ul>
        <li>Subscriptions are billed monthly at the price displayed at time of purchase.</li>
        <li>Payment is charged to your Apple ID account at confirmation of purchase.</li>
        <li>Subscriptions automatically renew unless cancelled at least 24 hours before the end of the current billing period.</li>
        <li>You can manage or cancel your subscription in Settings &gt; Apple ID &gt; Subscriptions on your device.</li>
        <li>No refunds are provided for partial billing periods.</li>
      </ul>

      <h2>Free Trial</h2>
      <p>
        If a free trial is offered, it converts to a paid subscription at
        the end of the trial period unless cancelled. Any unused portion of
        a free trial is forfeited when you purchase a subscription.
      </p>

      <h2>Intellectual Property</h2>
      <p>
        Prompts you create with PromptForger are yours. We claim no
        ownership over your input or generated output.
      </p>

      <h2>Limitation of Liability</h2>
      <p>
        PromptForger is provided "as is" without warranties of any kind. We
        are not liable for any damages arising from your use of the app or
        the prompts it generates.
      </p>

      <h2>Changes</h2>
      <p>
        We may update these terms from time to time. Continued use of the
        app after changes constitutes acceptance.
      </p>

      <h2>Contact</h2>
      <p>
        Questions? Contact us at support@promptforger.com.
      </p>
    </LegalPage>
  );
}
