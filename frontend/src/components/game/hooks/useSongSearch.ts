import { useCallback, useEffect, useState } from 'react';
import type { Song } from '@/types/game';

export function useSongSearch(guess: string, category: string) {
  const [searchResults, setSearchResults] = useState<Song[]>([]);

  useEffect(() => {
    if (guess.length < 2) {
      setSearchResults([]);
      return;
    }

    const searchSongs = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/songs/search?q=${encodeURIComponent(guess)}&category=${category}`
        );
        const data = await response.json();
        setSearchResults(data.results || []);
      } catch (error) {
        console.error('Error searching songs:', error);
      }
    };

    const debounce = setTimeout(searchSongs, 300);
    return () => clearTimeout(debounce);
  }, [guess, category]);

  const clearResults = useCallback(() => setSearchResults([]), []);

  return { searchResults, clearResults };
}
