import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { JoinGameDto } from './dto/game.dto';

@Injectable()
export class GamePlayersService {
  constructor(private prisma: DatabaseService) { }

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
