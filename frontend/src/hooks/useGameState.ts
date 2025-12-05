import { useMemo } from 'react';
import { useGame } from '../contexts/GameContext';

export function useGameState() {
  const { game, currentPlayer } = useGame();

  const isSpymaster = currentPlayer?.role === 'spymaster';
  const isOperative = currentPlayer?.role === 'operative';
  const isMyTeamTurn = game?.currentTeam === currentPlayer?.team;
  const isMyTurnToGiveClue = isSpymaster && isMyTeamTurn && !game?.currentClue;
  const isMyTurnToGuess = isOperative && isMyTeamTurn && !!game?.currentClue;

  const canStartGame = useMemo(() => {
    if (!game || game.state !== 'lobby') return false;

    const players = Object.values(game.players);
    const hasRedSpymaster = players.some(p => p.team === 'red' && p.role === 'spymaster');
    const hasBlueSpymaster = players.some(p => p.team === 'blue' && p.role === 'spymaster');

    return hasRedSpymaster && hasBlueSpymaster;
  }, [game]);

  const teamPlayers = useMemo(() => {
    if (!game) return { red: [], blue: [], unassigned: [] };

    const players = Object.values(game.players);
    return {
      red: players.filter(p => p.team === 'red'),
      blue: players.filter(p => p.team === 'blue'),
      unassigned: players.filter(p => !p.team),
    };
  }, [game]);

  return {
    isSpymaster,
    isOperative,
    isMyTeamTurn,
    isMyTurnToGiveClue,
    isMyTurnToGuess,
    canStartGame,
    teamPlayers,
  };
}
