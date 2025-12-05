import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { Game, Player, Team, Role, WebSocketMessage } from '../types/game';
import { websocketService } from '../services/websocket';

interface GameContextType {
  game: Game | null;
  playerId: string | null;
  currentPlayer: Player | null;
  isConnected: boolean;
  error: string | null;
  connect: (gameId: string) => void;
  disconnect: () => void;
  joinGame: (playerName: string) => void;
  assignRole: (team: Team, role: Role) => void;
  startGame: () => void;
  giveClue: (word: string, number: number) => void;
  revealCard: (position: number) => void;
  endTurn: () => void;
  resetGame: () => void;
  clearError: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [game, setGame] = useState<Game | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentPlayer = game && playerId ? game.players[playerId] || null : null;

  const handleMessage = useCallback((message: WebSocketMessage) => {
    switch (message.type) {
      case 'connected':
        setPlayerId(message.payload.playerId as string);
        break;

      case 'game_state':
        setGame(message.payload as unknown as Game);
        break;

      case 'error':
        setError(message.payload.message as string);
        break;

      case 'game_started':
      case 'clue_given':
      case 'card_revealed':
      case 'turn_ended':
      case 'player_joined':
      case 'player_left':
        // Game state is updated via game_state message
        break;

      case 'game_over':
        // Game state already updated, could add notification here
        break;

      case 'game_reset':
        // Game state will be updated
        break;
    }
  }, []);

  useEffect(() => {
    const unsubMessage = websocketService.onMessage(handleMessage);
    const unsubConnect = websocketService.onConnect(() => setIsConnected(true));
    const unsubDisconnect = websocketService.onDisconnect(() => {
      setIsConnected(false);
    });

    return () => {
      unsubMessage();
      unsubConnect();
      unsubDisconnect();
    };
  }, [handleMessage]);

  const connect = useCallback((gameId: string) => {
    setError(null);
    websocketService.connect(gameId);
  }, []);

  const disconnect = useCallback(() => {
    websocketService.disconnect();
    setGame(null);
    setPlayerId(null);
    setIsConnected(false);
  }, []);

  const joinGame = useCallback((playerName: string) => {
    websocketService.send({
      type: 'join_game',
      payload: { player_name: playerName },
    });
  }, []);

  const assignRole = useCallback((team: Team, role: Role) => {
    websocketService.send({
      type: 'assign_role',
      payload: { team, role },
    });
  }, []);

  const startGame = useCallback(() => {
    websocketService.send({
      type: 'start_game',
      payload: {},
    });
  }, []);

  const giveClue = useCallback((word: string, number: number) => {
    websocketService.send({
      type: 'give_clue',
      payload: { word, number },
    });
  }, []);

  const revealCard = useCallback((position: number) => {
    websocketService.send({
      type: 'reveal_card',
      payload: { position },
    });
  }, []);

  const endTurn = useCallback(() => {
    websocketService.send({
      type: 'end_turn',
      payload: {},
    });
  }, []);

  const resetGame = useCallback(() => {
    websocketService.send({
      type: 'reset_game',
      payload: {},
    });
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return (
    <GameContext.Provider
      value={{
        game,
        playerId,
        currentPlayer,
        isConnected,
        error,
        connect,
        disconnect,
        joinGame,
        assignRole,
        startGame,
        giveClue,
        revealCard,
        endTurn,
        resetGame,
        clearError,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
