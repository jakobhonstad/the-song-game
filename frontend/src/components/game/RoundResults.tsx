import type { Game, Round } from '@/types/game';

interface RoundResultsProps {
  game: Game;
  currentRound: Round;
  isHost: boolean;
  onNextRound: () => void;
}

export default function RoundResults({ game, currentRound, isHost, onNextRound }: RoundResultsProps) {
  return (
    <div className="flex items-center justify-center p-8 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 min-h-screen w-full">
      <div className="max-w-3xl w-full bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-8 md:p-12 text-white">
        <h1 className="text-4xl font-bold mb-8 text-center">
          Runde {currentRound.roundNumber} - Resultater
        </h1>

        <div className="mb-8 p-6 bg-white/20 rounded-xl text-center">
          <div className="text-2xl font-bold mb-2">Riktig svar:</div>
          <div className="text-4xl font-bold">{currentRound.songTitle}</div>
          {currentRound.songArtist && (
            <div className="text-xl text-white/80 mt-2">{currentRound.songArtist}</div>
          )}
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Svar</h2>
          <div className="space-y-2">
            {currentRound.answers?.map((answer) => (
              <div
                key={answer.id}
                className={`p-4 rounded-xl flex items-center justify-between ${
                  answer.isCorrect ? 'bg-green-500/30' : 'bg-red-500/20'
                }`}
              >
                <div>
                  <span className="font-bold">{answer.player?.name}</span>
                  <span className="text-white/70 ml-2">gjette: &quot;{answer.guess}&quot;</span>
                </div>
                <div className="flex items-center gap-2">
                  {answer.isCorrect ? '✅' : '❌'}
                  <span className="font-bold">+{answer.points}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Poengstilling</h2>
          <div className="space-y-2">
            {game.players
              .sort((a, b) => b.score - a.score)
              .map((player, index) => (
                <div
                  key={player.id}
                  className="p-4 bg-white/20 rounded-xl flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold">{index + 1}.</span>
                    <span className="font-medium">{player.name}</span>
                  </div>
                  <span className="text-2xl font-bold">{player.score}</span>
                </div>
              ))}
          </div>
        </div>

        {isHost ? (
          <button
            onClick={onNextRound}
            className="w-full px-8 py-4 bg-white text-purple-600 rounded-xl font-bold text-lg hover:bg-white/90 transition-all transform hover:scale-105 shadow-lg"
          >
            {game.currentRound < game.maxRounds ? 'Neste Runde' : 'Vis Sluttresultat'}
          </button>
        ) : (
          <div className="text-center text-white/70">
            Venter på at verten starter neste runde...
          </div>
        )}
      </div>
    </div>
  );
}
