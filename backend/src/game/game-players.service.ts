import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateGameDto, JoinGameDto } from './dto/game.dto';

// generateGameCode() må flyttes, gir ikke mening at generateGameCode ligger i game-players filen  
function generateGameCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

@Injectable()
export class GamePlayersService {
  constructor(private prisma: DatabaseService) { }

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
    const existingPlayer = game.players.find((p) => p.id === playerId);
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
}
