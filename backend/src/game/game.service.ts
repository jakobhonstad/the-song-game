import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateGameDto, JoinGameDto } from './dto/game.dto';
import { GamePlayersService } from './game-players.service';
import { GameRoundsService } from './game-rounds.service';
import { GameAnswersService } from './game-answers.service';

@Injectable()
export class GameService {
  constructor(
    private prisma: DatabaseService,
    private playersService: GamePlayersService,
    private roundsService: GameRoundsService,
    private answersService: GameAnswersService,
  ) {}

  async createGame(createGameDto: CreateGameDto, hostId: string) {
    return this.playersService.createGame(createGameDto, hostId);
  }

  async joinGame(joinGameDto: JoinGameDto, playerId: string) {
    return this.playersService.joinGame(joinGameDto, playerId);
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
    return this.roundsService.startGame(code);
  }

  async submitAnswer(gameCode: string, roundId: string, playerId: string, guess: string, timeElapsed: number) {
    return this.answersService.submitAnswer(gameCode, roundId, playerId, guess, timeElapsed);
  }

  async nextRound(code: string) {
    return this.roundsService.nextRound(code);
  }

  async deleteOldGames() {
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const result = await this.prisma.game.deleteMany({
      where: {
        createdAt: {
          lt: oneDayAgo,
        },
      },
    });

    console.log(`🗑️ Deleted ${result.count} games older than 24 hours`);
    return result;
  }
}
