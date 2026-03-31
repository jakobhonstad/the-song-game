import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { JoinGameDto } from './dto/game.dto';

@Injectable()
export class GamePlayersService {
  constructor(private prisma: DatabaseService) { }

  async joinGame(joinGameDto: JoinGameDto) {
    const game = await this.prisma.game.findUnique({
      where: { code: joinGameDto.code },
      include: { players: true, rounds: true },
    });

    if (!game) {
      throw new Error('Game not found');
    }

    // Check if player already joined
    const existingPlayer = game.players.find(p => p.name === joinGameDto.playerName);

    if (existingPlayer) {
      throw new Error('Name already taken in this game');
    };

    await this.prisma.player.create({
      data: {
        gameId: game.id,
        name: joinGameDto.playerName,
      },
    });

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
