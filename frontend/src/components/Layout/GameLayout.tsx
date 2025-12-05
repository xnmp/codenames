import { ReactNode } from 'react';
import { useGame } from '../../contexts/GameContext';

interface GameLayoutProps {
  children: ReactNode;
}

export function GameLayout({ children }: GameLayoutProps) {
  const { error, clearError, disconnect } = useGame();

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <a href="/" className="text-2xl font-bold text-gray-800">
            CODENAMES
          </a>
          <button
            onClick={() => {
              disconnect();
              window.location.href = '/';
            }}
            className="text-gray-600 hover:text-gray-800 transition-colors"
          >
            Leave Game
          </button>
        </div>
      </header>

      {/* Error Toast */}
      {error && (
        <div className="fixed top-4 right-4 bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg z-50 flex items-center gap-3">
          <span>{error}</span>
          <button
            onClick={clearError}
            className="text-white/80 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}
