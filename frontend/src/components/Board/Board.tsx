import { useGame } from '../../contexts/GameContext';
import { Card } from './Card';

export function Board() {
  const { game } = useGame();

  if (!game || game.cards.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        Waiting for game to start...
      </div>
    );
  }

  return (
    <div className="grid grid-cols-5 gap-2 p-4 bg-amber-900/20 rounded-xl">
      {game.cards.map((card) => (
        <Card key={card.position} card={card} />
      ))}
    </div>
  );
}
