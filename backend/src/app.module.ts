import { Module } from '@nestjs/common';
import { GameModule } from './game/game.module';
import { DatabaseModule } from './database/database.module';
import { SongsModule } from './songs/songs.module';

@Module({
  imports: [GameModule, DatabaseModule, SongsModule],
})
export class AppModule { }
