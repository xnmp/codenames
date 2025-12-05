import { useState } from 'react';
import { useGame } from '../../contexts/GameContext';
import { useGameState } from '../../hooks/useGameState';

export function ClueInput() {
  const { giveClue, game } = useGame();
  const { isMyTurnToGiveClue } = useGameState();
  const [word, setWord] = useState('');
  const [number, setNumber] = useState(1);

  if (!isMyTurnToGiveClue || game?.state !== 'in_progress') {
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (word.trim() && number >= 0) {
      giveClue(word.trim(), number);
      setWord('');
      setNumber(1);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-4">
      <h3 className="text-lg font-semibold mb-3 text-center">Give a Clue</h3>

      <div className="flex gap-2">
        <input
          type="text"
          value={word}
          onChange={(e) => setWord(e.target.value.replace(/\s/g, ''))}
          placeholder="One word clue"
          className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />

        <input
          type="number"
          value={number}
          onChange={(e) => setNumber(Math.max(0, parseInt(e.target.value) || 0))}
          min="0"
          max="9"
          className="w-20 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          type="submit"
          disabled={!word.trim()}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Submit
        </button>
      </div>

      <p className="text-xs text-gray-500 mt-2 text-center">
        Enter a one-word clue and the number of cards it relates to
      </p>
    </form>
  );
}
