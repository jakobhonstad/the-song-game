export interface Game {
  id: string;
  code: string;
  category: string;
  status: GameStatus;
  hostId: string | null;
  currentRound: number;
  maxRounds: number;
  createdAt: string;
  updatedAt: string;
  players: Player[];
  rounds?: Round[];
}

export interface Player {
  id: string;
  gameId: string;
  name: string;
  score: number;
  isHost: boolean;
  createdAt: string;
}

export interface Round {
  id: string;
  gameId: string;
  roundNumber: number;
  songId: string;
  songTitle?: string; // Hidden during gameplay
  songArtist?: string | null;
  audioUrl?: string | null;
  startedAt: string;
  endedAt?: string | null;
  answers?: Answer[];
}

export interface Answer {
  id: string;
  roundId: string;
  playerId: string;
  guess: string;
  isCorrect: boolean;
  points: number;
  submittedAt: string;
  player?: Player;
}

export interface Song {
  id: string;
  title: string;
  artist: string | null;
  category: string;
  audioUrl: string | null;
  imageUrl: string | null;
  createdAt: string;
}

export type GameStatus = 'WAITING' | 'PLAYING' | 'ROUND_END' | 'FINISHED';

export interface WebSocketMessage {
  type: string;
  [key: string]: any;
}
