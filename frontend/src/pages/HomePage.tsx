import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../utils/constants';

export function HomePage() {
  const navigate = useNavigate();
  const [joinCode, setJoinCode] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');

  const handleCreateGame = async () => {
    setIsCreating(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/games`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to create game');
      }

      const data = await response.json();
      navigate(`/game/${data.game_id}`);
    } catch {
      setError('Failed to create game. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinGame = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const code = joinCode.trim().toUpperCase();
    if (!code) return;

    try {
      const response = await fetch(`${API_BASE_URL}/games/${code}/exists`);
      const data = await response.json();

      if (data.exists) {
        navigate(`/game/${code}`);
      } else {
        setError('Game not found. Check the code and try again.');
      }
    } catch {
      setError('Failed to check game. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-gray-800 mb-2">CODENAMES</h1>
          <p className="text-gray-600">The classic word guessing game</p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-100 text-red-700 px-4 py-2 rounded-lg text-center">
              {error}
            </div>
          )}

          {/* Create Game */}
          <div>
            <button
              onClick={handleCreateGame}
              disabled={isCreating}
              className="w-full py-4 bg-green-600 text-white rounded-xl font-bold text-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isCreating ? 'Creating...' : 'Create New Game'}
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center">
            <div className="flex-1 border-t border-gray-200"></div>
            <span className="px-4 text-gray-400 text-sm">or</span>
            <div className="flex-1 border-t border-gray-200"></div>
          </div>

          {/* Join Game */}
          <form onSubmit={handleJoinGame} className="space-y-3">
            <input
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder="Enter game code"
              className="w-full px-4 py-3 border rounded-xl text-center text-2xl font-mono tracking-widest uppercase focus:outline-none focus:ring-2 focus:ring-blue-500"
              maxLength={6}
            />
            <button
              type="submit"
              disabled={!joinCode.trim()}
              className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Join Game
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-gray-500 text-sm">
          <p>Play with 4+ players. One spymaster per team required.</p>
        </div>
      </div>
    </div>
  );
}
