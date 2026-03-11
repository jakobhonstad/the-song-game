'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useGameStore } from '@/lib/game-store';
import type { Game } from '@/types/game';
import Lobby from '@/components/game/Lobby';
import GamePlay from '@/components/game/GamePlay';
import GameResults from '@/components/game/GameResults';

export default function GamePage() {
  const params = useParams();
  const router = useRouter();
  const gameCode = params.code as string;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [initializedGame, setInitializedGame] = useState<Game | null>(null);

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

        // Connect to WebSocket (don't await to avoid blocking)
        void connectWebSocket(gameCode, playerId).catch((err: Error) => {
          console.error('WebSocket connection error:', err);
        });

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
    if (game?.code === gameCode) {
      setInitializedGame(game);
    }
  }, [game, gameCode]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 overflow-hidden">
        <Link href="/" className="fixed top-4 left-4 z-50 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-white/80 hover:text-white text-sm transition-colors">
          ← Hjem
        </Link>
        <main className="flex-1 flex items-center justify-center">
          <div className="text-white text-2xl">Laster spill...</div>
        </main>
      </div>
    );
  }

  if (error || !initializedGame) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 overflow-hidden">
        <Link href="/" className="fixed top-4 left-4 z-50 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-white/80 hover:text-white text-sm transition-colors">
          ← Hjem
        </Link>
        <main className="flex-1 flex items-center justify-center">
          <div className="text-white text-center">
            <div className="text-2xl mb-4">{error || 'Spill ikke funnet'}</div>
          </div>
        </main>
      </div>
    );
  }

  // Render different components based on game status with home button
  const renderContent = () => {
    switch (initializedGame.status) {
      case 'LOBBY':
        return <Lobby game={initializedGame} gameCode={gameCode} />;
      case 'PLAYING':
      case 'ROUND_END':
        return <GamePlay game={initializedGame} gameCode={gameCode} />;
      case 'FINISHED':
        return <GameResults game={initializedGame} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 overflow-hidden">
      <Link href="/" className="fixed top-4 left-4 z-50 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-white/80 hover:text-white text-sm transition-colors">
        ← Hjem
      </Link>
      <div className="flex-1 flex items-center justify-center p-8">
        {renderContent()}
      </div>
    </div>
  );
}
