import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GameModule } from './game/game.module';
import { DatabaseModule } from './database/database.module';
import { SongsModule } from './songs/songs.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    GameModule,
    DatabaseModule,
    SongsModule,
  ],
})
export class AppModule { }
