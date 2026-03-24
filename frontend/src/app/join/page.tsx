'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Game } from '@/types/game';
import { connectWebSocket } from "@/lib/game-socket";

export default function JoinGame() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [gameCode, setGameCode] = useState('');
  const [playerName, setPlayerName] = useState('');

  const handleJoinGame = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/games/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: gameCode.toUpperCase(),
          playerName,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Kunne ikke bli med i spillet');
      }

      const data: Game = await response.json();
      // Backend returns the game object directly, find the current player
      const playerId = data.players.find((player) => player.name === playerName)?.id;

      if (!playerId) {
        throw new Error('Spilleren ble ikke funnet i spillet');
      }
      // Store player info in localStorage
      localStorage.setItem('playerId', playerId);
      localStorage.setItem('playerName', playerName);

      // Connect to websocket
      await connectWebSocket(gameCode, playerId);

      // Redirect to game lobby
      router.push(`/game/${gameCode.toUpperCase()}`);


    } catch (err) {
      setError(err instanceof Error ? err.message : 'Noe gikk galt. Prøv igjen.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600">
      <div className="max-w-md w-full bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-8 md:p-12 text-white">
        <h1 className="text-4xl md:text-5xl font-bold mb-8 text-center">
          Bli med i spill
        </h1>

        <form onSubmit={handleJoinGame} className="space-y-6">
          <div>
            <label htmlFor="gameCode" className="block text-lg font-medium mb-2">
              Spillkode
            </label>
            <input
              id="gameCode"
              type="text"
              value={gameCode}
              onChange={(e) => setGameCode(e.target.value.toUpperCase())}
              placeholder="ABC123"
              required
              maxLength={6}
              className="w-full px-4 py-3 rounded-lg bg-white/20 border-2 border-white/30 text-white text-center text-2xl font-bold tracking-widest placeholder-white/60 focus:outline-none focus:border-white/60 transition-all uppercase"
            />
          </div>

          <div>
            <label htmlFor="playerName" className="block text-lg font-medium mb-2">
              Ditt navn
            </label>
            <input
              id="playerName"
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Skriv inn ditt navn"
              required
              maxLength={50}
              className="w-full px-4 py-3 rounded-lg bg-white/20 border-2 border-white/30 text-white placeholder-white/60 focus:outline-none focus:border-white/60 transition-all"
            />
          </div>

          {error && (
            <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !gameCode.trim() || !playerName.trim()}
            className="w-full px-8 py-4 bg-white text-purple-600 rounded-xl font-bold text-lg hover:bg-white/90 transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? 'Blir med...' : 'Bli med'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/" className="text-white/70 hover:text-white transition-colors">
            ← Tilbake
          </Link>
        </div>
      </div>
    </main>
  );
}
