import { Controller, Post, Get, Body, Param, Headers, Inject } from '@nestjs/common';
import { GameService } from './game.service';
import { GameGateway } from './game.gateway';
import { CreateGameDto, JoinGameDto } from './dto/game.dto';

@Controller('games')
export class GameController {
  constructor(
    private gameService: GameService,
    private gameGateway: GameGateway,
  ) {}

  @Post()
  async createGame(@Body() createGameDto: CreateGameDto, @Headers('x-player-id') playerId?: string) {
    const playerIdToUse = playerId || `player_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    return this.gameService.createGame(createGameDto, playerIdToUse);
  }

  @Post('join')
  async joinGame(@Body() joinGameDto: JoinGameDto, @Headers('x-player-id') playerId?: string) {
    const playerIdToUse = playerId || `player_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    return this.gameService.joinGame(joinGameDto, playerIdToUse);
  }

  @Get(':code')
  async getGame(@Param('code') code: string) {
    return this.gameService.getGame(code);
  }

  @Post(':code/start')
  async startGame(@Param('code') code: string) {
    console.log(`📡 [Controller] Starting game: ${code}`);
    const result = await this.gameService.startGame(code);
    console.log(`📡 [Controller] Game started, result rounds:`, { count: result?.rounds?.length, first: result?.rounds?.[0] });
    
    // Fetch updated game and broadcast to all players
    const game = await this.gameService.getGame(code);
    console.log(`📡 [Controller] Broadcasting, game rounds:`, { count: game?.rounds?.length, first: game?.rounds?.[0] });
    if (game) {
      this.gameGateway.broadcastToGamePublic(code, 'game-started', { game, round: game.rounds?.[0] });
      console.log(`📡 [Controller] Broadcasted game-started event`);
    }
    
    return result;
  }

  @Post(':code/next-round')
  async nextRound(@Param('code') code: string) {
    await this.gameService.nextRound(code);
    return { status: 'ok' };
  }

  @Post('submit-answer')
  async submitAnswer(
    @Body() body: { gameCode: string; roundId: string; playerId: string; guess: string; timeElapsed: number },
  ) {
    return this.gameService.submitAnswer(body.gameCode, body.roundId, body.playerId, body.guess, body.timeElapsed);
  }
}
