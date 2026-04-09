import { Injectable, forwardRef, Inject, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateGameDto, JoinGameDto } from './dto/game.dto';
import { GamePlayersService } from './game-players.service';
import { GameRoundsService } from './game-rounds.service';
import { GameAnswersService } from './game-answers.service';
import { GameCreateService } from './game-create.service';
import { GameGateway } from './game.gateway';

@Injectable()
export class GameService {
  constructor(
    private prisma: DatabaseService,
    private playersService: GamePlayersService,
    private roundsService: GameRoundsService,
    private answersService: GameAnswersService,
    private createService: GameCreateService,
    @Inject(forwardRef(() => GameGateway))
    private gameGateway: GameGateway,
  ) { }

  async createGame(createGameDto: CreateGameDto) {
    return this.createService.createGame(createGameDto);
  }

  async joinGame(joinGameDto: JoinGameDto) {
    return this.playersService.joinGame(joinGameDto);
  }

  // N + 1, henter alle svar og spillere for hver gang getGame kalles
  // kan ha egene metoder for å hente ulike delere
  // getGameLobby, getCurrentRound, getGameResult
  async getGame(code: string) {
    const game = await this.prisma.game.findUnique({
      where: { code },
      include: {
        players: true,
        rounds: {
          include: { answers: { include: { player: true } } },
        },
      },
    });

    if (!game) return null;

    // Hvis en runde er i gang ikke send med title, artist og previewUrl
    if (game.status === 'PLAYING') {
      return {
        ...game,
        rounds: game.rounds.map(({
          songTitle,
          songArtist,
          ...rest
        }) => rest),
      };
    }
    return game;
  }

  async startGame(code: string) {
    const result = await this.roundsService.startGame(code);
    const game = await this.getGame(code);
    if (game) {
      this.gameGateway.broadcastToGame(code, 'game-started', { game, round: game.rounds[0] })
    }
    return result;
  }

  async submitAnswer(gameCode: string, roundId: string, playerId: string, guess: string, timeElapsed: number) {
    const result = await this.answersService.submitAnswer(gameCode, roundId, playerId, guess, timeElapsed);
    const game = await this.getGame(gameCode);
    if (game && game.status === 'ROUND_END') {
      const currentRound = game.rounds?.find(r => r.id === roundId);
      this.gameGateway.broadcastToGame(gameCode, 'round-end', { game, round: currentRound, players: game.players });
    }
    return result;
  }

  async nextRound(code: string) {
    return this.roundsService.nextRound(code);
  }

  // Cron / CronExpression er innebygd i nestjs for å kjøre funskjoner på faste tidspunkt
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
