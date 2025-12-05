export type CardType = 'red' | 'blue' | 'neutral' | 'assassin';
export type Team = 'red' | 'blue';
export type Role = 'spymaster' | 'operative';
export type GameState = 'lobby' | 'in_progress' | 'finished';

export interface Card {
  word: string;
  type: CardType | null;
  revealed: boolean;
  position: number;
}

export interface Player {
  id: string;
  name: string;
  team?: Team;
  role?: Role;
}

export interface Clue {
  word: string;
  number: number;
  team: Team;
}

export interface Game {
  id: string;
  state: GameState;
  cards: Card[];
  players: Record<string, Player>;
  currentTeam: Team | null;
  startingTeam: Team | null;
  currentClue: Clue | null;
  guessesRemaining: number;
  winner: Team | null;
  redRemaining: number;
  blueRemaining: number;
  clueHistory: Clue[];
}

export interface WebSocketMessage {
  type: string;
  payload: Record<string, unknown>;
}
