import { create } from 'zustand';
import type { Game, Round, WebSocketMessage } from '@/types/game';

interface GameState {
  game: Game | null;
  currentRound: Round | null;
  ws: WebSocket | null;
  isConnected: boolean;
  
  // Actions
  setGame: (game: Game) => void;
  setCurrentRound: (round: Round | null) => void;
  updatePlayers: (players: any[]) => void;
  connectWebSocket: (gameCode: string, playerId: string) => void;
  disconnectWebSocket: () => void;
  sendMessage: (message: WebSocketMessage) => void;
  fetchGame: (gameCode: string) => Promise<void>;
}

export const useGameStore = create<GameState>((set, get) => ({
  game: null,
  currentRound: null,
  ws: null,
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
      const data = await response.json();
      set({ game: data.game });
    } catch (error) {
      console.error('Error fetching game:', error);
      throw error;
    }
  },

  connectWebSocket: (gameCode: string, playerId: string) => {
    const ws = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL}/ws`);

    ws.onopen = () => {
      console.log('WebSocket connected');
      set({ isConnected: true });
      
      // Send join message
      ws.send(JSON.stringify({
        type: 'join-game',
        gameCode,
        playerId,
      }));
    };

    ws.onmessage = (event) => {
      const message: WebSocketMessage = JSON.parse(event.data);
      console.log('WebSocket message:', message);

      switch (message.type) {
        case 'joined-game':
          set({ game: message.game });
          break;
          
        case 'player-joined':
          console.log('🎮 Player joined - updating players:', message.players);
          set((state: any) => ({
            game: state.game ? { ...state.game, players: message.players } : null,
          }));
          break;
          
        case 'game-started':
          set({ 
            game: message.game,
            currentRound: message.round,
          });
          break;
          
        case 'next-round':
          set({ currentRound: message.round });
          break;
          
        case 'round-end':
          set((state: any) => ({ 
            game: state.game ? { ...state.game, players: message.players } : null,
            currentRound: message.round,
          }));
          break;
          
        case 'game-finished':
          set((state) => ({
            game: state.game ? { 
              ...state.game, 
              status: 'FINISHED',
              players: message.leaderboard,
            } : null,
          }));
          break;
          
        case 'error':
          console.error('WebSocket error:', message.message);
          break;
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      set({ isConnected: false });
    };

    set({ ws });
  },

  disconnectWebSocket: () => {
    const { ws } = get();
    if (ws) {
      ws.close();
      set({ ws: null, isConnected: false });
    }
  },

  sendMessage: (message: WebSocketMessage) => {
    const { ws, isConnected } = get();
    if (ws && isConnected) {
      ws.send(JSON.stringify(message));
    }
  },
}));
