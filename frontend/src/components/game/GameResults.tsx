import Link from 'next/link';
import type { Game } from '@/types/game';

interface GameResultsProps {
  game: Game;
}

export default function GameResults({ game }: GameResultsProps) {
  const sortedPlayers = [...game.players].sort((a, b) => b.score - a.score);
  const winner = sortedPlayers[0];

  return (
    <main className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600">
      <div className="max-w-2xl w-full bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-8 md:p-12 text-white">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-4">🏆 Spillet er over!</h1>
          
          <div className="mb-8 p-8 bg-yellow-500/20 rounded-2xl border-4 border-yellow-500/50">
            <div className="text-6xl mb-4">👑</div>
            <div className="text-3xl font-bold mb-2">{winner.name}</div>
            <div className="text-xl text-white/80">vinner med {winner.score} poeng!</div>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 text-center">Sluttresultat</h2>
          <div className="space-y-3">
            {sortedPlayers.map((player, index) => (
              <div
                key={player.id}
                className={`p-5 rounded-xl flex items-center justify-between ${
                  index === 0
                    ? 'bg-yellow-500/30 border-2 border-yellow-500/50'
                    : index === 1
                    ? 'bg-gray-400/20 border-2 border-gray-400/30'
                    : index === 2
                    ? 'bg-orange-700/20 border-2 border-orange-700/30'
                    : 'bg-white/20'
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className="text-3xl font-bold">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`}
                  </span>
                  <div>
                    <div className="font-bold text-lg">{player.name}</div>
                    <div className="text-white/70 text-sm">
                      {Math.round((player.score / (game.maxRounds * 100)) * 100)}% riktig
                    </div>
                  </div>
                </div>
                <span className="text-3xl font-bold">{player.score}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <Link
            href="/"
            className="block w-full px-8 py-4 bg-white text-purple-600 rounded-xl font-bold text-lg text-center hover:bg-white/90 transition-all transform hover:scale-105 shadow-lg"
          >
            Spill igjen
          </Link>
          
          <button
            onClick={() => {
              const text = `🎵 Jeg spilte The Song Game og fikk ${
                game.players.find(p => p.id === localStorage.getItem('playerId'))?.score || 0
              } poeng! 🏆`;
              
              if (navigator.share) {
                navigator.share({ text });
              } else {
                navigator.clipboard.writeText(text);
                alert('Resultat kopiert!');
              }
            }}
            className="block w-full px-8 py-4 bg-purple-600/50 text-white rounded-xl font-bold text-lg text-center hover:bg-purple-600/70 transition-all border-2 border-white/30"
          >
            Del resultat
          </button>
        </div>

        <div className="mt-8 text-center text-white/70 text-sm">
          Takk for at du spilte! 🎵
        </div>
      </div>
    </main>
  );
}
