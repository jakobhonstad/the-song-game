import { io, type Socket } from 'socket.io-client';
import type { Game, Player, Round, WebSocketMessage } from '@/types/game';
import { useGameStore } from '@/lib/game-store';

let socket: Socket | null = null;

export async function connectWebSocket(gameCode: string, playerId: string): Promise<void> {
    return new Promise((resolve, reject) => {
        // If not on browser return
        if (typeof window === 'undefined') return reject(new Error("not in browser"));

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
            console.log("new socket connected");
            socket?.emit('join-game', { gameCode, playerId });
            resolve();
        });

        socket.on('connect_error', (err) => {
            console.error("Connection error:", err);
            reject(err);
        })

        // update for the current player that joined
        socket.on('joined-game', ({ game }: { game: Game }) => {
            if (!game?.code) return;

            updateGameState(game);
        });

        // Update new player for all players
        socket.on('player-joined', ({ game }: { game: Game }) => {
            if (!game?.code) return;

            updateGameState(game);
        })

        socket.on('game-started', ({ game, round }: { game: Game; round?: Round }) => {
            if (!game) return;

            const { setGame, setCurrentRound } = useGameStore.getState();
            setGame(game);
            setCurrentRound(round ?? null);
        });

        socket.on('answer-submitted', ({ game }: { game: Game }) => {
            if (!game) return;

            const { setGame } = useGameStore.getState();
            setGame(game);
        });

        socket.on('next-round', ({ game, round }: { game: Game; round?: Round; }) => {
            if (!game) return;

            const { setGame, setCurrentRound } = useGameStore.getState();
            setGame(game);
            setCurrentRound(round ?? null);
        });

        socket.on('game-finished', ({ game, leaderboard }: { game: Game; leaderboard: Player[]; }) => {
            if (!game) return;

            const { setGame, setCurrentRound } = useGameStore.getState();
            setGame({ ...game, players: leaderboard });
            setCurrentRound(null);
        });
    });
}

export function disconnectWebSocket() {
    if (!socket) return;
    socket.disconnect();
    socket = null;
}

export function sendMessage(message: WebSocketMessage) {
    if (!socket) return;
    const { type, ...data } = message;
    socket.emit(type, data);
}

export function updateGameState(game: Game) {
    const { setGame, setCurrentRound } = useGameStore.getState();
    setGame(game);

    const round =
        game.rounds?.find((r) => r.roundNumber === game.currentRound) || null;
    setCurrentRound(round);
}