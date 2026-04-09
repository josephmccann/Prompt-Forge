import { useState, useRef } from "react";
import { login } from "@/lib/auth";
import { KeyRound } from "lucide-react";

interface PasswordGateProps {
  onAuthenticated: () => void;
}

export default function PasswordGate({ onAuthenticated }: PasswordGateProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [shaking, setShaking] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(password)) {
      onAuthenticated();
    } else {
      setError(true);
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
      setPassword("");
      inputRef.current?.focus();
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center mx-auto mb-4">
            <KeyRound className="w-7 h-7 text-teal-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">
            Prompt<span className="text-teal-400">Forge</span>
          </h1>
          <p className="text-sm text-zinc-500">Enter password to continue</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className={`relative ${shaking ? "animate-shake" : ""}`}>
            <input
              ref={inputRef}
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(false);
              }}
              placeholder="Password"
              className={`w-full px-4 py-3 rounded-xl bg-white/5 border text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all ${
                error ? "border-red-500/50" : "border-white/10"
              }`}
              autoFocus
            />
          </div>
          {error && (
            <p className="text-red-400 text-sm mt-2 text-center">
              Incorrect password
            </p>
          )}
          <button
            type="submit"
            className="w-full mt-4 px-4 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-black font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Enter
          </button>
        </form>
      </div>
    </div>
  );
}
