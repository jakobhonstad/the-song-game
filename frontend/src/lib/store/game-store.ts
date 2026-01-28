import { create } from 'zustand';
import type { Socket } from 'socket.io-client';
import type { Game, Round, WebSocketMessage } from '@/types/game';

interface GameState {
  game: Game | null;
  currentRound: Round | null;
  socket: Socket | null;
  isConnected: boolean;
  
  // Actions
  setGame: (game: Game) => void;
  setCurrentRound: (round: Round | null) => void;
  updatePlayers: (players: any[]) => void;
  connectWebSocket: (gameCode: string, playerId: string) => Promise<void>;
  disconnectWebSocket: () => void;
  sendMessage: (message: WebSocketMessage) => void;
  fetchGame: (gameCode: string) => Promise<void>;
}

export const useGameStore = create<GameState>((set, get) => ({
  game: null,
  currentRound: null,
  socket: null,
  isConnected: false,

  setGame: (game) => set({ game }),
  
  setCurrentRound: (round) => set({ currentRound: round }),
  
  updatePlayers: (players) => set((state) => ({
    game: state.game ? { ...state.game, players } : null,
  })),

  fetchGame: async (gameCode: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/games/${gameCode}`);
      if (!response.ok) throw new Error('Game not found');
      const game = await response.json();
      set({ game });
    } catch (error) {
      console.error('Error fetching game:', error);
      throw error;
    }
  },

  connectWebSocket: async (gameCode: string, playerId: string) => {
    // Only run on client-side
    if (typeof window === 'undefined') {
      console.log('Skipping WebSocket connection on server-side');
      return;
    }

    try {
      // Dynamic import to avoid SSR issues
      const { io } = await import('socket.io-client');
      
      const socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001', {
        transports: ['websocket'],
        reconnection: true,
      });

      socket.on('connect', () => {
        console.log('Socket.IO connected');
        set({ isConnected: true });
        
        // Send join message
        socket.emit('join-game', { gameCode, playerId });
      });

      socket.on('joined-game', (game) => {
        console.log('✅ joined-game event received:', { game, hasCode: game?.code, code: game?.code });
        if (game && game.code) {
          set({ game });
        } else {
          console.warn('⚠️ joined-game: game or code undefined', game);
        }
      });

      socket.on('player-joined', (game) => {
        console.log('✅ player-joined event received:', { game, hasCode: game?.code });
        if (game && game.code) {
          set({ game });
        } else {
          console.warn('⚠️ player-joined: game or code undefined', game);
        }
      });

      socket.on('game-started', (data) => {
        console.log('✅ game-started event received:', data);
        // Backend sends either { game, round } or just game directly
        const game = data.game || data;
        let round = data.round;
        
        // If no explicit round, get first round from game.rounds
        if (!round && game.rounds && game.rounds.length > 0) {
          round = game.rounds[0];
          console.log('✅ [game-started] Got round from game.rounds[0]');
        }
        
        console.log('✅ [game-started] Setting game:', { code: game?.code, status: game?.status, roundsCount: game?.rounds?.length });
        console.log('✅ [game-started] Setting round:', { roundNumber: round?.roundNumber, songTitle: round?.songTitle });
        
        if (game && game.code) {
          set({ 
            game,
            currentRound: round || null,
          });
        } else {
          console.warn('⚠️ game-started: missing game or code', data);
        }
      });

      socket.on('next-round', (data) => {
        console.log('Next round:', data);
        set({ currentRound: data.round });
      });

      socket.on('round-end', (data) => {
        console.log('✅ round-end event received:', data);
        set((state: any) => ({ 
          game: data.game || (state.game ? { ...state.game, status: 'ROUND_END', players: data.players } : null),
          currentRound: data.round,
        }));
      });

      socket.on('game-finished', (data) => {
        console.log('Game finished:', data);
        set((state) => ({
          game: state.game ? { 
            ...state.game, 
            status: 'FINISHED',
            players: data.leaderboard,
          } : null,
        }));
      });

      socket.on('error', (data) => {
        console.error('Socket error:', data);
      });

      socket.on('disconnect', () => {
        console.log('Socket.IO disconnected');
        set({ isConnected: false });
      });

      set({ socket });
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
    }
  },

  disconnectWebSocket: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null, isConnected: false });
    }
  },

  sendMessage: (message: WebSocketMessage) => {
    const { socket, isConnected } = get();
    if (socket && isConnected) {
      const { type, ...data } = message;
      socket.emit(type, data);
    }
  },
}));
