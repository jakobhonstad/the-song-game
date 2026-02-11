import type { Game, Round, Song } from '@/types/game';

interface RoundPlayProps {
  game: Game;
  currentRound: Round;
  guess: string;
  hasSubmitted: boolean;
  timeElapsed: number;
  searchResults: Song[];
  onGuessChange: (value: string) => void;
  onSelectSuggestion: (value: string) => void;
  onSubmitAnswer: () => void;
  onNextRound: () => void;
}

export default function RoundPlay({
  game,
  currentRound,
  guess,
  hasSubmitted,
  timeElapsed,
  searchResults,
  onGuessChange,
  onSelectSuggestion,
  onSubmitAnswer,
  onNextRound,
}: RoundPlayProps) {
  const promptText =
    game.category === 'film'
      ? '🎬 Hør og gjett hvilken film!'
      : game.category === 'tv'
      ? '📺 Hør og gjett hvilken serie!'
      : '🎵 Hør og gjett!';

  const placeholderText =
    game.category === 'film'
      ? 'Skriv filmnavnet...'
      : game.category === 'tv'
      ? 'Skriv serienavnet...'
      : 'Skriv ditt gjett...';

  return (
    <div className="max-w-2xl w-full bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-8 md:p-12 text-white">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">{promptText}</h1>
        <div className="text-white/70 mb-4">
          Runde {currentRound.roundNumber} av {game.maxRounds}
        </div>
        <div className="text-6xl font-bold">
          {Math.max(0, Math.floor((30000 - timeElapsed) / 1000))}s
        </div>
      </div>

      <div className="mb-8 p-6 bg-white/20 rounded-xl text-center">
        <div className="text-xl mb-4">Musikk spiller...</div>
        <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-white transition-all duration-100"
            style={{ width: `${Math.min(100, (timeElapsed / 30000) * 100)}%` }}
          />
        </div>
      </div>

      {!hasSubmitted ? (
        <div className="space-y-4">
          <div className="relative">
            <input
              type="text"
              value={guess}
              onChange={(e) => onGuessChange(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onSubmitAnswer()}
              placeholder={placeholderText}
              className="w-full px-4 py-4 rounded-xl bg-white/20 border-2 border-white/30 text-white text-lg placeholder-white/60 focus:outline-none focus:border-white/60 transition-all"
              autoFocus
            />

            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl max-h-60 overflow-y-auto z-10">
                {searchResults.map((song) => {
                  const displayName =
                    game.category === 'film'
                      ? song.movie || song.title
                      : game.category === 'tv'
                      ? song.tvShow || song.title
                      : song.title;

                  return (
                    <button
                      key={song.id}
                      onClick={() => onSelectSuggestion(displayName)}
                      className="w-full text-left px-4 py-3 hover:bg-purple-100 transition-colors text-purple-900 border-b border-purple-100 last:border-b-0"
                    >
                      <div className="font-bold">{displayName}</div>
                      {(game.category === 'film' || game.category === 'tv') && (
                        <div className="text-sm text-purple-600">
                          {song.title} - {song.artist}
                        </div>
                      )}
                      {!game.category && song.artist && (
                        <div className="text-sm text-purple-600">{song.artist}</div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <button
            onClick={onSubmitAnswer}
            disabled={!guess.trim()}
            className="w-full px-8 py-4 bg-white text-purple-600 rounded-xl font-bold text-lg hover:bg-white/90 transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            Send inn svar
          </button>
          <button onClick={onNextRound}>Neste runde</button>
        </div>
      ) : (
        <div className="text-center p-6 bg-green-500/20 rounded-xl">
          <div className="text-2xl font-bold mb-2">✅ Svar sendt inn!</div>
          <div className="text-white/80">Venter på de andre spillerne...</div>
        </div>
      )}

      <div className="mt-8">
        <h3 className="text-lg font-bold mb-3">Spillere ({game.players.length})</h3>
        <div className="grid grid-cols-2 gap-2">
          {game.players.map((player) => {
            const hasAnswered = currentRound.answers?.some((a) => a.playerId === player.id);
            return (
              <div
                key={player.id}
                className={`p-3 rounded-lg ${hasAnswered ? 'bg-green-500/30' : 'bg-white/20'}`}
              >
                <div className="font-medium truncate">{player.name}</div>
                <div className="text-sm text-white/70">{player.score} poeng</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
