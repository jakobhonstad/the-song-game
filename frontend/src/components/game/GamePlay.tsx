'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { Game } from '@/types/game';
import { useGameStore } from '@/lib/store/game-store';
import RoundResults from './RoundResults';
import RoundPlay from './RoundPlay';
import { useAudioPreview } from './hooks/useAudioPreview';
import { useRoundTimer } from './hooks/useRoundTimer';
import { useSongSearch } from './hooks/useSongSearch';

interface GamePlayProps {
  game: Game;
  gameCode: string;
}

export default function GamePlay({ game, gameCode }: GamePlayProps) {
  const { currentRound, sendMessage } = useGameStore();
  const [guess, setGuess] = useState('');
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const playerId = typeof window !== 'undefined' ? localStorage.getItem('playerId') : null;
  const isHost = game.players.find(p => p.id === playerId)?.isHost || false;

  const timeElapsed = useRoundTimer({
    status: game.status,
    currentRound,
    isHost,
    hasSubmitted,
    onTimeout: () => {
      console.log('⏰ Time is up! Host ending round...');
      sendMessage({
        type: 'next-round',
        gameCode,
      });
    },
  });

  useAudioPreview({
    status: game.status,
    currentRound,
    isHost,
  });

  const { searchResults, clearResults } = useSongSearch(guess, game.category);

  // Reset state on new round
  useEffect(() => {
    if (game.status === 'PLAYING') {
      setHasSubmitted(false);
      setGuess('');
      clearResults();
    }
  }, [currentRound?.id, game.status, clearResults]);

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
    clearResults();
  };

  const handleNextRound = () => {
    sendMessage({
      type: 'next-round',
      gameCode,
    });
  };

  const selectSuggestion = (title: string) => {
    setGuess(title);
    clearResults();
  };

  if (!currentRound) {
    return (
      <div className="flex items-center justify-center bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 min-h-screen w-full">
        <div className="text-white text-center">
          <div className="text-2xl mb-8">Laster runde...</div>
          <Link href="/" className="text-white/70 hover:text-white">← Tilbake til forsiden</Link>
        </div>
      </div>
    );
  }

  // Show results after round ends
  if (game.status === 'ROUND_END') {
    return (
      <RoundResults
        game={game}
        currentRound={currentRound}
        isHost={isHost}
        onNextRound={handleNextRound}
      />
    );
  }

  return (
    <RoundPlay
      game={game}
      currentRound={currentRound}
      guess={guess}
      hasSubmitted={hasSubmitted}
      timeElapsed={timeElapsed}
      searchResults={searchResults}
      onGuessChange={setGuess}
      onSelectSuggestion={selectSuggestion}
      onSubmitAnswer={handleSubmitAnswer}
      onNextRound={handleNextRound}
    />
  );
}
