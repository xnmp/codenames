import { useGame } from '../../contexts/GameContext';
import { useGameState } from '../../hooks/useGameState';

export function PlayerList() {
  const { playerId } = useGame();
  const { teamPlayers } = useGameState();

  const PlayerItem = ({ player, isYou }: { player: { id: string; name: string; role?: string }; isYou: boolean }) => (
    <div className={`px-3 py-1 rounded ${isYou ? 'bg-yellow-100 font-semibold' : ''}`}>
      {player.name} {isYou && '(You)'}
      {player.role && (
        <span className="text-xs ml-1 opacity-70">
          ({player.role})
        </span>
      )}
    </div>
  );

  return (
    <div className="bg-white rounded-xl shadow-lg p-4">
      <h3 className="text-lg font-semibold mb-4 text-center">Players</h3>

      <div className="space-y-4">
        {/* Red Team */}
        <div>
          <h4 className="text-red-600 font-semibold mb-2 flex items-center">
            <span className="w-3 h-3 rounded-full bg-red-600 mr-2"></span>
            Red Team ({teamPlayers.red.length})
          </h4>
          <div className="space-y-1 ml-5">
            {teamPlayers.red.length === 0 ? (
              <p className="text-gray-400 text-sm italic">No players yet</p>
            ) : (
              teamPlayers.red.map(p => (
                <PlayerItem key={p.id} player={p} isYou={p.id === playerId} />
              ))
            )}
          </div>
        </div>

        {/* Blue Team */}
        <div>
          <h4 className="text-blue-600 font-semibold mb-2 flex items-center">
            <span className="w-3 h-3 rounded-full bg-blue-600 mr-2"></span>
            Blue Team ({teamPlayers.blue.length})
          </h4>
          <div className="space-y-1 ml-5">
            {teamPlayers.blue.length === 0 ? (
              <p className="text-gray-400 text-sm italic">No players yet</p>
            ) : (
              teamPlayers.blue.map(p => (
                <PlayerItem key={p.id} player={p} isYou={p.id === playerId} />
              ))
            )}
          </div>
        </div>

        {/* Unassigned */}
        {teamPlayers.unassigned.length > 0 && (
          <div>
            <h4 className="text-gray-600 font-semibold mb-2">Unassigned</h4>
            <div className="space-y-1 ml-5">
              {teamPlayers.unassigned.map(p => (
                <PlayerItem key={p.id} player={p} isYou={p.id === playerId} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
