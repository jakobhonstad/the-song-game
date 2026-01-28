import { Controller, Post, Get, Body, Param, Headers } from '@nestjs/common';
import { GameService } from './game.service';
import { CreateGameDto, JoinGameDto } from './dto/game.dto';

@Controller('games')
export class GameController {
  constructor(private gameService: GameService) {}

  @Post()
  async createGame(@Body() createGameDto: CreateGameDto, @Headers('x-player-id') playerId: string) {
    return this.gameService.createGame(createGameDto, playerId);
  }

  @Post('join')
  async joinGame(@Body() joinGameDto: JoinGameDto, @Headers('x-player-id') playerId: string) {
    return this.gameService.joinGame(joinGameDto, playerId);
  }

  @Get(':code')
  async getGame(@Param('code') code: string) {
    return this.gameService.getGame(code);
  }

  @Post(':code/start')
  async startGame(@Param('code') code: string) {
    return this.gameService.startGame(code);
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
