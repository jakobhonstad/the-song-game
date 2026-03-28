'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useGameStore } from '@/lib/game-store';
import { connectWebSocket } from '@/lib/game-socket';

const categories = [
  { id: 'film', name: '🎬 Film', description: 'Temalåter fra kjente filmer' },
  { id: 'tv', name: '📺 TV-serier', description: 'Temalåter fra TV-serier' },
];

export default function CreateGame() {
  const router = useRouter();
  const { setGame } = useGameStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('film');
  const [hostName, setHostName] = useState('');

  const handleCreateGame = async (e: React.FormEvent) => {
    // Stops race condition
    if (loading) return;

    e.preventDefault();
    setLoading(true);
    setError('');

    const trimmedHostName = hostName.trim();
    if (!trimmedHostName) {
      setError("Host name kan ikke være tomt")
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/games`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: selectedCategory,
          hostName: trimmedHostName,
          maxRounds: 10,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Kunne ikke opprette spill');
      }

      const data = await response.json();
      const gameCode = data.code;
      const playerId = data.players[0].id;

      // Store player info in localStorage
      localStorage.setItem('playerId', playerId);
      localStorage.setItem('playerName', hostName);

      // Connect to websocket
      await connectWebSocket(gameCode, playerId);

      // Set game in store before redirecting
      setGame(data);

      // Redirect to lobby
      router.push(`/game/${gameCode}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Noe gikk galt. Prøv igjen.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600">
      <div className="max-w-2xl w-full bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-8 md:p-12 text-white">
        <h1 className="text-4xl md:text-5xl font-bold mb-8 text-center">
          Opprett nytt spill
        </h1>

        <form onSubmit={handleCreateGame} className="space-y-6">
          <div>
            <label htmlFor="hostName" className="block text-lg font-medium mb-2">
              Ditt navn
            </label>
            <input
              id="hostName"
              type="text"
              value={hostName}
              onChange={(e) => setHostName(e.target.value)}
              placeholder="Skriv inn ditt navn"
              required
              maxLength={50}
              className="w-full px-4 py-3 rounded-lg bg-white/20 border-2 border-white/30 text-white placeholder-white/60 focus:outline-none focus:border-white/60 transition-all"
            />
          </div>

          <div>
            <label className="block text-lg font-medium mb-4">
              Velg kategori
            </label>
            <div className="space-y-3">
              {categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setSelectedCategory(category.id)}
                  className={`w-full p-4 rounded-lg text-left transition-all ${selectedCategory === category.id
                    ? 'bg-white text-purple-600 shadow-lg'
                    : 'bg-white/20 hover:bg-white/30'
                    }`}
                >
                  <div className="font-bold text-lg">{category.name}</div>
                  <div className={`text-sm ${selectedCategory === category.id ? 'text-purple-600/80' : 'text-white/70'}`}>
                    {category.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !hostName.trim()}
            className="w-full px-8 py-4 bg-white text-purple-600 rounded-xl font-bold text-lg hover:bg-white/90 transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? 'Oppretter...' : 'Opprett Spill'}
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
