/**
 * Generate a random 6-character game code
 */
export function generateGameCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed similar looking chars
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Calculate points based on correctness and speed
 */
export function calculatePoints(isCorrect: boolean, timeElapsedMs: number, maxTimeMs: number = 30000): number {
  if (!isCorrect) return 0;
  
  // Base points
  const basePoints = 100;
  
  // Speed bonus (0-50 points)
  const speedRatio = 1 - (timeElapsedMs / maxTimeMs);
  const speedBonus = Math.floor(speedRatio * 50);
  
  return basePoints + Math.max(0, speedBonus);
}

/**
 * Normalize string for comparison (lowercase, trim, remove special chars)
 */
export function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, '');
}

/**
 * Check if guess matches answer (with fuzzy matching)
 */
export function isAnswerCorrect(guess: string, answer: string): boolean {
  const normalizedGuess = normalizeString(guess);
  const normalizedAnswer = normalizeString(answer);
  
  // Exact match
  if (normalizedGuess === normalizedAnswer) return true;
  
  // Check if guess contains answer or vice versa (for partial matches)
  if (normalizedGuess.includes(normalizedAnswer) || normalizedAnswer.includes(normalizedGuess)) {
    // Allow partial match if it's at least 70% of the length
    const minLength = Math.min(normalizedGuess.length, normalizedAnswer.length);
    const maxLength = Math.max(normalizedGuess.length, normalizedAnswer.length);
    return minLength / maxLength >= 0.7;
  }
  
  return false;
}
