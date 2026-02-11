'use client';

import { useState, useEffect, useRef } from 'react';
import type { Game } from '@/types/game';
import { useGameStore } from '@/lib/store/game-store';

interface GamePlayProps {
  game: Game;
  gameCode: string;
}

export default function GamePlay({ game, gameCode }: GamePlayProps) {
  const { currentRound, sendMessage } = useGameStore();
  const [guess, setGuess] = useState('');
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playerId = typeof window !== 'undefined' ? localStorage.getItem('playerId') : null;
  const isHost = game.players.find(p => p.id === playerId)?.isHost || false;

  // Timer
  useEffect(() => {
    if (game.status === 'PLAYING' && currentRound) {
      const startTime = Date.now();
      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        setTimeElapsed(elapsed);
        
        // Auto-end round when time runs out (only host triggers this)
        if (elapsed >= 30000 && isHost && !hasSubmitted) {
          console.log('⏰ Time is up! Host ending round...');
          clearInterval(interval);
          // Wait a second then trigger round end
          setTimeout(() => {
            handleNextRound();
          }, 1000);
        }
      }, 100);

      return () => clearInterval(interval);
    }
  }, [game.status, currentRound, isHost]);

  // Play audio previews from Deezer
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }

    const audio = audioRef.current;

    if (currentRound?.previewUrl && game.status === 'PLAYING' && isHost) {
      audio.src = currentRound.previewUrl;
      audio.play().catch((err) => {
        console.error('Error playing audio preview:', err);
      });
    }

    return () => {
      audio.pause();
    };
  }, [currentRound?.id, currentRound?.previewUrl, game.status]);

  // Reset state on new round
  useEffect(() => {
    if (game.status === 'PLAYING') {
      setHasSubmitted(false);
      setGuess('');
      setTimeElapsed(0);
    }
  }, [currentRound?.id, game.status]);

  // Search for songs (autocomplete)
  useEffect(() => {
    if (guess.length < 2) {
      setSearchResults([]);
      return;
    }

    const searchSongs = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/songs/search?q=${encodeURIComponent(guess)}&category=${game.category}`
        );
        const data = await response.json();
        setSearchResults(data.results || []);
      } catch (error) {
        console.error('Error searching songs:', error);
      }
    };

    const debounce = setTimeout(searchSongs, 300);
    return () => clearTimeout(debounce);
  }, [guess, game.category]);

  const handleSubmitAnswer = () => {
    if (!currentRound || !playerId || !guess.trim() || hasSubmitted) return;

    sendMessage({
      type: 'submit-answer',
      roundId: currentRound.id,
      playerId,
      guess: guess.trim(),
      timeElapsed,
    });

    setHasSubmitted(true);
    setSearchResults([]);
  };

  const handleNextRound = () => {
    sendMessage({
      type: 'next-round',
      gameCode,
    });
  };

  const selectSuggestion = (title: string) => {
    setGuess(title);
    setSearchResults([]);
  };

  if (!currentRound) {
    return (
      <div className="flex items-center justify-center bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 min-h-screen w-full">
        <div className="text-white text-center">
          <div className="text-2xl mb-8">Laster runde...</div>
          <a href="/" className="text-white/70 hover:text-white">← Tilbake til forsiden</a>
        </div>
      </div>
    );
  }

  // Show results after round ends
  if (game.status === 'ROUND_END') {
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
                    <span className="text-white/70 ml-2">gjette: "{answer.guess}"</span>
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

          {isHost && (
            <button
              onClick={handleNextRound}
              className="w-full px-8 py-4 bg-white text-purple-600 rounded-xl font-bold text-lg hover:bg-white/90 transition-all transform hover:scale-105 shadow-lg"
            >
              {game.currentRound < game.maxRounds ? 'Neste Runde' : 'Vis Sluttresultat'}
            </button>
          )}

          {!isHost && (
            <div className="text-center text-white/70">
              Venter på at verten starter neste runde...
            </div>
          )}
        </div>
      </div>
    );
  }

  // Playing state
  const promptText = game.category === 'film' 
    ? '🎬 Hør og gjett hvilken film!'
    : game.category === 'tv'
    ? '📺 Hør og gjett hvilken serie!'
    : '🎵 Hør og gjett!';

  const placeholderText = game.category === 'film'
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
              onChange={(e) => setGuess(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmitAnswer()}
              placeholder={placeholderText}
              className="w-full px-4 py-4 rounded-xl bg-white/20 border-2 border-white/30 text-white text-lg placeholder-white/60 focus:outline-none focus:border-white/60 transition-all"
              autoFocus
            />
            
            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl max-h-60 overflow-y-auto z-10">
                {searchResults.map((song) => {
                  const displayName = game.category === 'film' 
                    ? song.movie 
                    : game.category === 'tv' 
                    ? song.tvShow 
                    : song.title;
                  
                  return (
                    <button
                      key={song.id}
                      onClick={() => selectSuggestion(displayName)}
                      className="w-full text-left px-4 py-3 hover:bg-purple-100 transition-colors text-purple-900 border-b border-purple-100 last:border-b-0"
                    >
                      <div className="font-bold">{displayName}</div>
                      {(game.category === 'film' || game.category === 'tv') && (
                        <div className="text-sm text-purple-600">{song.title} - {song.artist}</div>
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
            onClick={handleSubmitAnswer}
            disabled={!guess.trim()}
            className="w-full px-8 py-4 bg-white text-purple-600 rounded-xl font-bold text-lg hover:bg-white/90 transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            Send inn svar
          </button>
          <button
            onClick={handleNextRound}
          >
            Neste runde
          </button>
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
            const hasAnswered = currentRound.answers?.some(a => a.playerId === player.id);
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
