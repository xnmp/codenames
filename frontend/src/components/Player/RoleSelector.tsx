import { useGame } from '../../contexts/GameContext';
import { Team, Role } from '../../types/game';

export function RoleSelector() {
  const { assignRole, currentPlayer, game } = useGame();

  if (!game) return null;

  const handleRoleSelect = (team: Team, role: Role) => {
    assignRole(team, role);
  };

  const isRoleTaken = (team: Team, role: Role) => {
    return Object.values(game.players).some(
      p => p.id !== currentPlayer?.id && p.team === team && p.role === role
    );
  };

  const isSelected = (team: Team, role: Role) => {
    return currentPlayer?.team === team && currentPlayer?.role === role;
  };

  const RoleButton = ({ team, role, label }: { team: Team; role: Role; label: string }) => {
    const taken = isRoleTaken(team, role);
    const selected = isSelected(team, role);

    return (
      <button
        onClick={() => handleRoleSelect(team, role)}
        disabled={taken}
        className={`
          px-4 py-2 rounded-lg font-medium transition-all
          ${selected
            ? team === 'red'
              ? 'bg-red-600 text-white ring-2 ring-red-300'
              : 'bg-blue-600 text-white ring-2 ring-blue-300'
            : taken
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : team === 'red'
                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
          }
        `}
      >
        {label}
        {taken && ' (Taken)'}
      </button>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-4">
      <h3 className="text-lg font-semibold mb-4 text-center">Choose Your Role</h3>

      <div className="space-y-4">
        {/* Red Team */}
        <div className="space-y-2">
          <h4 className="text-red-600 font-semibold text-center">Red Team</h4>
          <div className="flex gap-2 justify-center">
            <RoleButton team="red" role="spymaster" label="Spymaster" />
            <RoleButton team="red" role="operative" label="Operative" />
          </div>
        </div>

        {/* Blue Team */}
        <div className="space-y-2">
          <h4 className="text-blue-600 font-semibold text-center">Blue Team</h4>
          <div className="flex gap-2 justify-center">
            <RoleButton team="blue" role="spymaster" label="Spymaster" />
            <RoleButton team="blue" role="operative" label="Operative" />
          </div>
        </div>
      </div>

      {currentPlayer?.team && currentPlayer?.role && (
        <div className="mt-4 text-center text-sm text-gray-600 border-t pt-3">
          You are: <span className={`font-semibold ${currentPlayer.team === 'red' ? 'text-red-600' : 'text-blue-600'}`}>
            {currentPlayer.team.toUpperCase()} {currentPlayer.role.toUpperCase()}
          </span>
        </div>
      )}
    </div>
  );
}
