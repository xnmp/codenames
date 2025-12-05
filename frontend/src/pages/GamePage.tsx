import { useParams } from 'react-router-dom';
import { useGame } from '../contexts/GameContext';
import { GameLayout } from '../components/Layout/GameLayout';
import { GameLobby } from '../components/Game/GameLobby';
import { Board } from '../components/Board/Board';
import { GameInfo } from '../components/Game/GameInfo';
import { ClueInput } from '../components/Game/ClueInput';
import { GameOver } from '../components/Game/GameOver';
import { PlayerList } from '../components/Player/PlayerList';

export function GamePage() {
  const { gameId } = useParams<{ gameId: string }>();
  const { game } = useGame();

  if (!gameId) {
    return (
      <GameLayout>
        <div className="text-center text-red-600">Invalid game ID</div>
      </GameLayout>
    );
  }

  // Show lobby if game is in lobby state or not loaded yet
  if (!game || game.state === 'lobby') {
    return (
      <GameLayout>
        <GameLobby gameId={gameId} />
      </GameLayout>
    );
  }

  // Game in progress or finished
  return (
    <GameLayout>
      <div className="grid lg:grid-cols-[1fr_300px] gap-6">
        {/* Main game area */}
        <div className="space-y-4">
          <Board />
          <ClueInput />
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <GameInfo />
          <PlayerList />
        </div>
      </div>

      {/* Game Over Modal */}
      <GameOver />
    </GameLayout>
  );
}
