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
  const [initializedGame, setInitializedGame] = useState<any>(null);

  const { game, connectWebSocket, fetchGame } = useGameStore();

  useEffect(() => {
    const playerId = localStorage.getItem('playerId');
    const playerName = localStorage.getItem('playerName');

    if (!playerId || !playerName) {
      router.push('/join');
      return;
    }

    let hasInitialized = false;

    const init = async () => {
      if (hasInitialized) return;
      hasInitialized = true;

      try {
        // Get current game from store
        let currentGame = useGameStore.getState().game;
        
        // Only fetch if game is not already in store or has wrong code
        if (!currentGame || currentGame.code !== gameCode) {
          console.log('Fetching game from API...');
          await fetchGame(gameCode);
          // Get updated game after fetch
          currentGame = useGameStore.getState().game;
        } else {
          console.log('Game already in store, skipping fetch');
        }
        
        // Verify game is actually set before proceeding
        if (!currentGame) {
          throw new Error('Game not found');
        }
        
        // Set the initialized game to local state
        setInitializedGame(currentGame);
        
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameCode]);

  // Update local game state when store game changes
  useEffect(() => {
    if (game && game.code === gameCode) {
      setInitializedGame(game);
    }
  }, [game, gameCode]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600">
        <div className="text-white text-2xl">Laster spill...</div>
      </main>
    );
  }

  if (error || !initializedGame) {
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
  switch (initializedGame.status) {
    case 'WAITING':
      return <Lobby game={initializedGame} gameCode={gameCode} />;
    case 'PLAYING':
    case 'ROUND_END':
      return <GamePlay game={initializedGame} gameCode={gameCode} />;
    case 'FINISHED':
      return <GameResults game={initializedGame} />;
    default:
      return null;
  }
}
