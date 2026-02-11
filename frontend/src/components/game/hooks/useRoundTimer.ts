import { useEffect, useState } from 'react';
import type { Round } from '@/types/game';

interface UseRoundTimerOptions {
  status: string;
  currentRound: Round | null;
  isHost: boolean;
  hasSubmitted: boolean;
  onTimeout: () => void;
}

export function useRoundTimer({ status, currentRound, isHost, hasSubmitted, onTimeout }: UseRoundTimerOptions) {
  const [timeElapsed, setTimeElapsed] = useState(0);

  useEffect(() => {
    if (status === 'PLAYING') {
      setTimeElapsed(0);
    }
  }, [status, currentRound?.id]);

  useEffect(() => {
    if (status === 'PLAYING' && currentRound) {
      const startTime = Date.now();
      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        setTimeElapsed(elapsed);

        if (elapsed >= 30000 && isHost && !hasSubmitted) {
          clearInterval(interval);
          setTimeout(() => {
            onTimeout();
          }, 1000);
        }
      }, 100);

      return () => clearInterval(interval);
    }

    return undefined;
  }, [status, currentRound, isHost, hasSubmitted, onTimeout]);

  return timeElapsed;
}
