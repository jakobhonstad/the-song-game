import type { Game } from '@/types/game';
import { useEffect, useState } from 'react';

interface LobbyProps {
  game: Game;
  gameCode: string;
}

export default function Lobby({ game, gameCode }: LobbyProps) {
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const isHost = game.players.find(p => p.id === playerId)?.isHost || false;

  useEffect(() => {
    // Get playerId from localStorage as a fallback
    const id = localStorage.getItem('playerId');
    setPlayerId(id);
  }, [game, game.players]);

  const handleStartGame = async () => {
    setError('');

    try {
      if (!isHost) {
        setError('Bare host kan starte spillet');
        return;
      }
      /*
      For testing, må endres til 2.
      Kan vurdere å la det være bare en spiller, hvis man spille med gjetting IRL.
      Isåfall må man legge til en funskjon som sier hva svaret er etter hver runde.
      */
      if (game.players.length < 1) {
        setError('Ikke nok spillere');
        return;
      }

      const url = `${process.env.NEXT_PUBLIC_API_URL}/api/games/${gameCode}/start`;

      const response = await fetch(url, {
        method: 'POST',
      });


      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || `HTTP ${response.status}: Kunne ikke starte spillet`);
      }

      // Game status should update via WebSocket event, no need to do anything here
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Klarer ikke starte spill');
      console.error(err);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(gameCode);
    // Silent copy - no popup
  };

  return (
    <div className="max-w-2xl w-full bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-8 md:p-12 text-white">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">Spill Lobby</h1>

        <div className="inline-block bg-white/20 rounded-xl p-4 mb-4">
          <div className="text-sm text-white/70 mb-1">Spillkode</div>
          <div className="flex items-center gap-3">
            <div className="text-4xl font-bold tracking-widest">{gameCode}</div>
            <button
              onClick={handleCopyCode}
              className="px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all text-sm"
            >
              📋 Kopier
            </button>
          </div>
        </div>

        <div className="text-white/80">
          Kategori: <span className="font-bold">{game.category === 'film' ? '🎬 Film' : '📺 TV-serier'}</span>
        </div>
        <div className="text-white/80">
          Antall runder: <span className="font-bold">{game.maxRounds}</span>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">
          Spillere ({game.players.length})
        </h2>
        <div className="space-y-2">
          {game.players.map((player) => (
            <div
              key={player.id}
              className="flex items-center justify-between p-4 bg-white/20 rounded-xl"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/30 rounded-full flex items-center justify-center font-bold">
                  {player.name.charAt(0).toUpperCase()}
                </div>
                <span className="font-medium">{player.name}</span>
              </div>
              {player.isHost && (
                <span className="px-3 py-1 bg-yellow-500/80 rounded-full text-sm font-bold">
                  👑 Vert
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {game.players.length < 1 && (
        <div className="mb-6 p-4 bg-yellow-500/20 border border-yellow-500/50 rounded-lg text-center">
          Trenger minst 1 spiller for å starte
        </div>
      )}

      {isHost ? (
        <button
          onClick={handleStartGame}
          disabled={game.players.length < 1}
          className="w-full px-8 py-4 bg-white text-purple-600 rounded-xl font-bold text-lg hover:bg-white/90 transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          Start Spill
        </button>
      ) : (
        <div className="text-center text-white/70">
          Venter på at verten starter spillet...
        </div>
      )}
    </div>
  );
}
