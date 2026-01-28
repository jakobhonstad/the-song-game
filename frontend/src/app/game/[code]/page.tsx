'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useGameStore } from '@/lib/store/game-store';
import Lobby from '@/components/game/Lobby';
import GamePlay from '@/components/game/GamePlay';
import GameResults from '@/components/game/GameResults';

export default function GamePage() {
  const params = useParams();
  const router = useRouter();
  const gameCode = params.code as string;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { game, connectWebSocket, fetchGame } = useGameStore();

  useEffect(() => {
    const playerId = localStorage.getItem('playerId');
    const playerName = localStorage.getItem('playerName');

    if (!playerId || !playerName) {
      router.push('/join');
      return;
    }

    const init = async () => {
      try {
        // Fetch game data
        await fetchGame(gameCode);
        
        // Connect to WebSocket
        connectWebSocket(gameCode, playerId);
        
        setLoading(false);
      } catch (err) {
        console.error('Error initializing game:', err);
        setError('Kunne ikke laste spillet');
        setLoading(false);
      }
    };

    init();

    return () => {
      // Cleanup WebSocket on unmount if needed
    };
  }, [gameCode, connectWebSocket, fetchGame, router]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600">
        <div className="text-white text-2xl">Laster spill...</div>
      </main>
    );
  }

  if (error || !game) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600">
        <div className="text-white text-center">
          <div className="text-2xl mb-4">{error || 'Spill ikke funnet'}</div>
          <a href="/" className="text-white/70 hover:text-white">← Tilbake til forsiden</a>
        </div>
      </main>
    );
  }

  // Render different components based on game status
  switch (game.status) {
    case 'WAITING':
      return <Lobby game={game} gameCode={gameCode} />;
    case 'PLAYING':
    case 'ROUND_END':
      return <GamePlay game={game} gameCode={gameCode} />;
    case 'FINISHED':
      return <GameResults game={game} />;
    default:
      return null;
  }
}
