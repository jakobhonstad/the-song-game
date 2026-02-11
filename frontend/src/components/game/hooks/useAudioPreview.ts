import { useEffect, useRef } from 'react';
import type { Round } from '@/types/game';

interface UseAudioPreviewOptions {
  status: string;
  currentRound: Round | null;
  isHost: boolean;
}

export function useAudioPreview({ status, currentRound, isHost }: UseAudioPreviewOptions) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }

    const audio = audioRef.current;

    if (currentRound?.previewUrl && status === 'PLAYING' && isHost) {
      audio.src = currentRound.previewUrl;
      audio.play().catch((err) => {
        console.error('Error playing audio preview:', err);
      });
    }

    return () => {
      audio.pause();
    };
  }, [currentRound?.id, currentRound?.previewUrl, status, isHost]);
}
