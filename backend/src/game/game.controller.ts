import { Controller, Post, Get, Body, Param, Headers, BadRequestException, UnauthorizedException, Patch, NotFoundException } from '@nestjs/common';
import { GameService } from './game.service';
import { GameGateway } from './game.gateway';
import { CreateGameDto, JoinGameDto, SubmitAnswerDto } from './dto/game.dto';

@Controller('games')
export class GameController {
  constructor(
    private gameService: GameService,
  ) { }

  @Post()
  async createGame(@Body() createGameDto: CreateGameDto) {
    try {
      return await this.gameService.createGame(createGameDto);
    } catch (e) {
      console.error('createGame error:', e);
      throw new BadRequestException('Kunne ikke opprette spill');
    }
  }

  @Post('join')
  async joinGame(@Body() joinGameDto: JoinGameDto) {
    return this.gameService.joinGame(joinGameDto);
  }

  @Get(':code')
  async getGame(@Param('code') code: string) {
    const game = await this.gameService.getGame(code);
    if (!game) {
      throw new NotFoundException('Kunne ikke finne spill')
    }
    return game;
  }

  @Post(':code/start')
  async startGame(@Param('code') code: string) {
    const result = await this.gameService.startGame(code);
    return result;
  }

  @Post(':code/next-round')
  async nextRound(@Param('code') code: string) {
    await this.gameService.nextRound(code);
    return { status: 'ok' };
  }

  @Post('submit-answer')
  async submitAnswer(@Body() submitAnswerDto: SubmitAnswerDto) {
    const result = await this.gameService.submitAnswer(
      submitAnswerDto.gameCode,
      submitAnswerDto.roundId,
      submitAnswerDto.playerId,
      submitAnswerDto.guess,
      submitAnswerDto.timeElapsed
    );
    return result;
  }

  @Post('cleanup')
  async cleanupOldGames(@Headers('x-api-key') apiKey: string) {
    if (apiKey !== process.env.CLEANUP_API_KEY) {
      throw new UnauthorizedException();
    }
    return this.gameService.deleteOldGames();
  }
}
