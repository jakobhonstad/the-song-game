export interface Game {
  id: string;
  code: string;
  category: string;
  status: GameStatus;
  hostId: string;
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
  songTitle: string;
  songArtist?: string | null;
  category: string;
  createdAt: string;
  previewUrl?: string | null;
  answers?: Answer[];
}

export interface Answer {
  id: string;
  roundId: string;
  playerId: string;
  guess: string;
  isCorrect: boolean;
  points: number;
  timeElapsed: number;
  createdAt: string;
  player?: Player;
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  category: string;
  movie?: string | null;
  tvShow?: string | null;
  spotifyId?: string | null;
  previewUrl?: string | null;
  createdAt: string;
}

export type GameStatus = 'LOBBY' | 'PLAYING' | 'ROUND_END' | 'FINISHED';

export interface WebSocketMessage {
  type: string;
  [key: string]: any;
}
