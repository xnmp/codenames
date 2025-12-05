import { useGame } from '../../contexts/GameContext';
import { useGameState } from '../../hooks/useGameState';

export function GameInfo() {
  const { game, currentPlayer, endTurn } = useGame();
  const { isMyTurnToGuess } = useGameState();

  if (!game) return null;

  const isInProgress = game.state === 'in_progress';

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 space-y-4">
      {/* Score Display */}
      <div className="flex justify-center gap-8">
        <div className="text-center">
          <div className="text-3xl font-bold text-red-600">{game.redRemaining}</div>
          <div className="text-sm text-gray-500">Red remaining</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-600">{game.blueRemaining}</div>
          <div className="text-sm text-gray-500">Blue remaining</div>
        </div>
      </div>

      {/* Current Turn */}
      {isInProgress && game.currentTeam && (
        <div className="text-center">
          <div
            className={`
              inline-block px-4 py-2 rounded-full font-semibold
              ${game.currentTeam === 'red' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}
            `}
          >
            {game.currentTeam.toUpperCase()} TEAM'S TURN
          </div>
        </div>
      )}

      {/* Current Clue */}
      {isInProgress && game.currentClue && (
        <div className="text-center space-y-2">
          <div className="text-sm text-gray-500">Current Clue</div>
          <div className="text-2xl font-bold">
            {game.currentClue.word} - {game.currentClue.number}
          </div>
          <div className="text-sm text-gray-600">
            Guesses remaining: {game.guessesRemaining}
          </div>
        </div>
      )}

      {/* Your Role */}
      {currentPlayer && (
        <div className="text-center text-sm text-gray-600 border-t pt-2">
          You are:{' '}
          <span
            className={`
              font-semibold
              ${currentPlayer.team === 'red' ? 'text-red-600' : ''}
              ${currentPlayer.team === 'blue' ? 'text-blue-600' : ''}
            `}
          >
            {currentPlayer.team?.toUpperCase()} {currentPlayer.role?.toUpperCase()}
          </span>
        </div>
      )}

      {/* End Turn Button */}
      {isMyTurnToGuess && game.currentClue && (
        <div className="text-center">
          <button
            onClick={endTurn}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            End Turn
          </button>
        </div>
      )}

      {/* Game Over */}
      {game.state === 'finished' && game.winner && (
        <div className="text-center">
          <div
            className={`
              text-2xl font-bold
              ${game.winner === 'red' ? 'text-red-600' : 'text-blue-600'}
            `}
          >
            {game.winner.toUpperCase()} TEAM WINS!
          </div>
        </div>
      )}
    </div>
  );
}
