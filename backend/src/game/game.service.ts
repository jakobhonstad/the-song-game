import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGameDto, JoinGameDto } from './dto/game.dto';

function generateGameCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function calculatePoints(timeElapsed: number, isCorrect: boolean): number {
  if (!isCorrect) return 0;
  const timeInSeconds = timeElapsed / 1000;
  const maxTime = 30;
  return Math.max(0, Math.round(100 * (1 - timeInSeconds / maxTime)));
}

@Injectable()
export class GameService {
  constructor(private prisma: PrismaService) {}

  async createGame(createGameDto: CreateGameDto, hostId: string) {
    const code = generateGameCode();
    
    const game = await this.prisma.game.create({
      data: {
        code,
        hostId,
        category: createGameDto.category,
        maxRounds: createGameDto.maxRounds || 10,
        players: {
          create: {
            id: hostId,
            name: createGameDto.hostName,
            isHost: true,
          },
        },
      },
      include: {
        players: true,
        rounds: true,
      },
    });

    return game;
  }

  async joinGame(joinGameDto: JoinGameDto, playerId: string) {
    const game = await this.prisma.game.findUnique({
      where: { code: joinGameDto.code },
      include: { players: true, rounds: true },
    });

    if (!game) {
      throw new Error('Game not found');
    }

    // Check if player already joined
    const existingPlayer = game.players.find(p => p.id === playerId);
    if (!existingPlayer) {
      await this.prisma.player.create({
        data: {
          id: playerId,
          gameId: game.id,
          name: joinGameDto.playerName,
        },
      });
    }

    // Fetch updated game with players
    return this.prisma.game.findUnique({
      where: { code: joinGameDto.code },
      include: {
        players: true,
        rounds: {
          include: { answers: true },
        },
      },
    });
  }

  async getGame(code: string) {
    return this.prisma.game.findUnique({
      where: { code },
      include: {
        players: true,
        rounds: {
          include: { answers: { include: { player: true } } },
        },
      },
    });
  }

  async startGame(code: string) {
    const game = await this.prisma.game.findUnique({
      where: { code },
      include: { players: true },
    });

    if (!game) {
      throw new Error('Game not found');
    }

    // Get random songs for the rounds
    const songs = await this.prisma.song.findMany({
      where: { category: game.category },
      take: game.maxRounds,
    });

    console.log(`🎵 [startGame] Found ${songs.length} songs for category "${game.category}"`);

    if (songs.length === 0) {
      throw new Error(`No songs found for category "${game.category}". Make sure songs are seeded in the database.`);
    }

    // Update game status
    await this.prisma.game.update({
      where: { id: game.id },
      data: { status: 'PLAYING', currentRound: 1 },
    });

    // Create rounds with songs
    const rounds: any[] = [];
    for (let i = 0; i < Math.min(songs.length, game.maxRounds); i++) {
      const song = songs[i];
      const round = await this.prisma.round.create({
        data: {
          gameId: game.id,
          roundNumber: i + 1,
          songId: song.id,
          songTitle: song.title,
          songArtist: song.artist,
          category: song.category,
        },
      });
      rounds.push(round);
    }

    console.log(`🎵 [startGame] Created ${rounds.length} rounds`);

    return this.prisma.game.findUnique({
      where: { code },
      include: {
        players: true,
        rounds: { include: { answers: true } },
      },
    });
  }

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
    
    // For film category: check against movie name
    // For tv category: check against TV show name  
    if (round.category === 'film' || round.category === 'tv') {
      const song = await this.prisma.song.findUnique({ 
        where: { id: round.songId } 
      });
      
      if (song) {
        if (round.category === 'film' && song.movie) {
          correctAnswer = song.movie!;
        } else if (round.category === 'tv' && song.tvShow) {
          correctAnswer = song.tvShow!;
        }
      }
    }

    // Check if guess is correct (case-insensitive, fuzzy matching)
    const correctLower = correctAnswer.toLowerCase().trim();
    const guessLower = guess.toLowerCase().trim();
    const isCorrect = guessLower === correctLower || 
                     correctLower.includes(guessLower) ||
                     guessLower.includes(correctLower);

    const points = calculatePoints(timeElapsed, isCorrect);

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
    await this.prisma.player.update({
      where: { id: playerId },
      data: { score: { increment: points } },
    });

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

  async nextRound(code: string) {
    const game = await this.prisma.game.findUnique({
      where: { code },
      include: { rounds: true },
    });

    if (!game) {
      throw new Error('Game not found');
    }

    if (game.currentRound >= game.maxRounds) {
      // Game finished
      await this.prisma.game.update({
        where: { id: game.id },
        data: { status: 'FINISHED' },
      });
      return;
    }

    // Move to next round
    const nextRoundNum = game.currentRound + 1;
    await this.prisma.game.update({
      where: { id: game.id },
      data: { status: 'PLAYING', currentRound: nextRoundNum },
    });
  }
}
