import { io, type Socket } from 'socket.io-client';
import type { Game, Player, Round, WebSocketMessage } from '@/types/game';
import { useGameStore } from '@/lib/game-store';

type GameEventPayload = {
    game?: Game;
    round?: Round;
    players?: Player[];
    leaderboard?: Player[];
} | Game;

let socket: Socket | null = null;

export async function connectGameSocket(gameCode: string, playerId: string) {
    // If not on browser return
    if (typeof window === 'undefined') return;

    // Close existing socket
    if (socket) {
        socket.disconnect();
        socket = null;
    }

    // Start new socket connection to backend, only use real websocket
    socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001', {
        transports: ['websocket'],
        reconnection: true,
    });
    // When new socket is started, send join-game
    socket.on('connect', () => {
        socket?.emit('join-game', { gameCode, playerId });
    });

    socket.on('joined-game', (game: Game) => {
        if (!game?.code) return;

        const { setGame, setCurrentRound } = useGameStore.getState();
        setGame(game);

        const round =
            game.rounds?.find((r) => r.roundNumber === game.currentRound) || null;
        setCurrentRound(round);
    });

    socket.on('game-started', ({ game, round }: { game: Game; round?: Round }) => {
        if (!game) return;

        const { setGame, setCurrentRound } = useGameStore.getState();
        setGame(game);
        setCurrentRound(round ?? null);
    });

    socket.on('answer-submitted')
}

export function disconnectGameSocket() {
    if (!socket) return;
    socket.disconnect();
    socket = null;
}

export function sendGameMessage(message: WebSocketMessage) {
    if (!socket) return;
    const { type, ...data } = message;
    socket.emit(type, data);
}