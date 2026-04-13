interface HeaderProps {
  onHistoryClick?: () => void;
  showHistory?: boolean;
}

export default function Header({ onHistoryClick, showHistory }: HeaderProps) {
  return (
    <header className="w-full border-b border-white/10 bg-[#0f0f0f]/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight text-white">
          Prompt<span className="text-teal-400">Forger</span>
        </h1>
        <div className="flex items-center gap-2">
          {showHistory && onHistoryClick && (
            <button
              onClick={onHistoryClick}
              className="text-sm text-zinc-400 hover:text-white transition-colors px-3 py-1.5 rounded-md hover:bg-white/5"
            >
              History
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
