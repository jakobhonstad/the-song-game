// Zustand kode
import { create } from 'zustand';
import type { Game, Player, Round } from '@/types/game';

interface GameState {
  game: Game | null;
  currentRound: Round | null;

  // Actions
  setGame: (game: Game) => void;
  setCurrentRound: (round: Round | null) => void;
  updatePlayers: (players: Player[]) => void;
  fetchGame: (gameCode: string) => Promise<void>;
}

export const useGameStore = create<GameState>((set) => ({
  game: null,
  currentRound: null,

  setGame: (game) => set({ game }),

  setCurrentRound: (round) => set({ currentRound: round }),

  updatePlayers: (players) => set((state) => ({
    game: state.game ? { ...state.game, players } : null,
  })),

  // Initial sync from REST: used when opening/reloading a game page.
  fetchGame: async (gameCode: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/games/${gameCode}`);
      if (!response.ok) throw new Error('Game not found');
      const game = await response.json();
      let currentRound: Round | null = null;
      if (game?.rounds?.length && typeof game.currentRound === 'number' && game.currentRound > 0) {
        currentRound = game.rounds.find((r: Round) => r.roundNumber === game.currentRound) || null;
      }
      set({ game, currentRound });
    } catch (error) {
      console.error('Error fetching game:', error);
      throw error;
    }
  },
}));
