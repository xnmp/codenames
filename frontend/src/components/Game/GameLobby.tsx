import { useState, useEffect } from 'react';
import { useGame } from '../../contexts/GameContext';
import { useGameState } from '../../hooks/useGameState';
import { RoleSelector } from '../Player/RoleSelector';
import { PlayerList } from '../Player/PlayerList';

interface GameLobbyProps {
  gameId: string;
}

export function GameLobby({ gameId }: GameLobbyProps) {
  const { connect, joinGame, startGame, isConnected, game, playerId } = useGame();
  const { canStartGame } = useGameState();
  const [playerName, setPlayerName] = useState('');
  const [hasJoined, setHasJoined] = useState(false);

  useEffect(() => {
    connect(gameId);
  }, [connect, gameId]);

  useEffect(() => {
    // Check if we've already joined (playerId exists in game.players)
    if (game && playerId && game.players[playerId]) {
      setHasJoined(true);
    }
  }, [game, playerId]);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (playerName.trim()) {
      joinGame(playerName.trim());
      setHasJoined(true);
    }
  };

  const copyGameCode = () => {
    navigator.clipboard.writeText(gameId);
  };

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Connecting to game...</p>
        </div>
      </div>
    );
  }

  if (!hasJoined) {
    return (
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-center mb-6">Join Game</h2>

        <div className="text-center mb-6">
          <p className="text-gray-600 mb-2">Game Code</p>
          <button
            onClick={copyGameCode}
            className="text-3xl font-mono font-bold tracking-widest bg-gray-100 px-4 py-2 rounded hover:bg-gray-200 transition-colors"
          >
            {gameId}
          </button>
          <p className="text-xs text-gray-500 mt-1">Click to copy</p>
        </div>

        <form onSubmit={handleJoin}>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Enter your name"
            className="w-full px-4 py-3 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            maxLength={20}
            required
          />
          <button
            type="submit"
            disabled={!playerName.trim()}
            className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Join Game
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Game Code */}
      <div className="bg-white rounded-xl shadow-lg p-4 text-center">
        <p className="text-gray-600 mb-1">Game Code</p>
        <button
          onClick={copyGameCode}
          className="text-3xl font-mono font-bold tracking-widest bg-gray-100 px-4 py-2 rounded hover:bg-gray-200 transition-colors"
        >
          {gameId}
        </button>
        <p className="text-xs text-gray-500 mt-1">Share this code with other players</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Role Selection */}
        <RoleSelector />

        {/* Players List */}
        <PlayerList />
      </div>

      {/* Start Game Button */}
      <div className="text-center">
        <button
          onClick={startGame}
          disabled={!canStartGame}
          className={`
            px-8 py-4 rounded-xl font-bold text-xl transition-all
            ${canStartGame
              ? 'bg-green-600 text-white hover:bg-green-700 transform hover:scale-105'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }
          `}
        >
          Start Game
        </button>
        {!canStartGame && (
          <p className="text-sm text-gray-500 mt-2">
            Need at least one spymaster per team to start
          </p>
        )}
      </div>
    </div>
  );
}
