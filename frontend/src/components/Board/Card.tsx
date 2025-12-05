import { Card as CardType } from '../../types/game';
import { useGame } from '../../contexts/GameContext';
import { useGameState } from '../../hooks/useGameState';

interface CardProps {
  card: CardType;
}

export function Card({ card }: CardProps) {
  const { revealCard, game } = useGame();
  const { isMyTurnToGuess, isSpymaster } = useGameState();

  const canClick = isMyTurnToGuess && !card.revealed && game?.state === 'in_progress';

  const handleClick = () => {
    if (canClick) {
      revealCard(card.position);
    }
  };

  const getCardColors = () => {
    // If card is revealed or player is spymaster, show the actual color
    if (card.revealed || (isSpymaster && card.type)) {
      switch (card.type) {
        case 'red':
          return card.revealed
            ? 'bg-red-600 text-white'
            : 'bg-red-100 border-red-400 text-red-800';
        case 'blue':
          return card.revealed
            ? 'bg-blue-600 text-white'
            : 'bg-blue-100 border-blue-400 text-blue-800';
        case 'neutral':
          return card.revealed
            ? 'bg-stone-400 text-white'
            : 'bg-stone-100 border-stone-400 text-stone-700';
        case 'assassin':
          return card.revealed
            ? 'bg-gray-900 text-white'
            : 'bg-gray-200 border-gray-700 text-gray-900';
        default:
          return 'bg-amber-50 border-amber-200 text-gray-800';
      }
    }

    // Unrevealed card for operative
    return 'bg-amber-50 border-amber-200 text-gray-800 hover:bg-amber-100';
  };

  return (
    <button
      onClick={handleClick}
      disabled={!canClick}
      className={`
        relative p-2 rounded-lg border-2 font-semibold text-sm uppercase tracking-wide
        transition-all duration-200 min-h-[60px] flex items-center justify-center
        ${getCardColors()}
        ${canClick ? 'cursor-pointer transform hover:scale-105 hover:shadow-lg' : ''}
        ${card.revealed ? 'opacity-90' : ''}
        ${!canClick && !card.revealed ? 'cursor-default' : ''}
      `}
    >
      <span className={card.revealed ? 'line-through opacity-70' : ''}>
        {card.word}
      </span>

      {/* Spymaster indicator dot */}
      {isSpymaster && !card.revealed && card.type && (
        <span
          className={`
            absolute top-1 right-1 w-2 h-2 rounded-full
            ${card.type === 'red' ? 'bg-red-500' : ''}
            ${card.type === 'blue' ? 'bg-blue-500' : ''}
            ${card.type === 'neutral' ? 'bg-stone-400' : ''}
            ${card.type === 'assassin' ? 'bg-gray-900' : ''}
          `}
        />
      )}
    </button>
  );
}
