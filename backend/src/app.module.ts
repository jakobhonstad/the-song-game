import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GameModule } from './game/game.module';
import { DatabaseModule } from './database/database.module';
import { SongsModule } from './songs/songs.module';

@Module({
  imports: [GameModule, DatabaseModule, SongsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
