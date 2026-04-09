import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class GameAnswersService {
  constructor(private prisma: DatabaseService) { }

  async submitAnswer(gameCode: string, roundId: string, playerId: string, guess: string, timeElapsed: number) {
    const round = await this.prisma.round.findUnique({
      where: { id: roundId },
      include: { answers: true },
    });

    if (!round) {
      throw new Error('Round not found');
    }

    // Determine correct answer based on category
    let correctAnswer = round.songTitle;

    const songCategory = await this.prisma.songCategory.findFirst({
      where: {
        songId: round.songId,
        category: { category: round.category }
      },
    });

    if (songCategory?.categoryDescription) {
      correctAnswer = songCategory.categoryDescription;
    };

    // Check if guess is correct (case-insensitive, fuzzy matching)
    const correctLower = correctAnswer.toLowerCase().trim();
    const guessLower = guess.toLowerCase().trim();
    const isCorrect =
      guessLower === correctLower || correctLower.includes(guessLower) || guessLower.includes(correctLower);

    const points = 1;

    // Create answer
    const answer = await this.prisma.answer.create({
      data: {
        roundId,
        playerId,
        guess,
        isCorrect,
        points,
        timeElapsed,
      },
      include: { player: true },
    });

    // Update player score
    if (isCorrect) {
      await this.prisma.player.update({
        where: { id: playerId },
        data: { score: { increment: points } },
      });
    };

    // Check if all players have answered
    const allAnswers = await this.prisma.answer.findMany({
      where: { roundId },
    });

    const game = await this.prisma.game.findUnique({
      where: { code: gameCode },
      include: { players: true },
    });

    if (game && allAnswers.length === game.players.length) {
      // All players answered, move to round end
      await this.prisma.game.update({
        where: { id: game.id },
        data: { status: 'ROUND_END' },
      });
    }

    return answer;
  }
}
