import { Module } from '@nestjs/common';
import { GameService } from './game.service';
import { GameController } from './game.controller';
import { GameGateway } from './game.gateway';
import { GamePlayersService } from './game-players.service';
import { GameRoundsService } from './game-rounds.service';
import { GameAnswersService } from './game-answers.service';
import { DatabaseModule } from '../database/database.module';
import { GameCreateService } from './game-create.service';

@Module({
  imports: [DatabaseModule],
  controllers: [GameController],
  providers: [
    GameService,
    GameGateway,
    GamePlayersService,
    GameRoundsService,
    GameAnswersService,
    GameCreateService,
  ],
  exports: [GameService],
})
export class GameModule { }
