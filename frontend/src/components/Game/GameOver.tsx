import { useGame } from '../../contexts/GameContext';

export function GameOver() {
  const { game, resetGame } = useGame();

  if (!game || game.state !== 'finished') {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 text-center">
        <h2
          className={`
            text-4xl font-bold mb-4
            ${game.winner === 'red' ? 'text-red-600' : 'text-blue-600'}
          `}
        >
          {game.winner?.toUpperCase()} TEAM WINS!
        </h2>

        <p className="text-gray-600 mb-6">
          Congratulations to the {game.winner} team!
        </p>

        <div className="flex gap-4 justify-center">
          <button
            onClick={resetGame}
            className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
          >
            Play Again
          </button>

          <button
            onClick={() => window.location.href = '/'}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            Leave Game
          </button>
        </div>
      </div>
    </div>
  );
}
