import { Controller, Get, Query } from '@nestjs/common';
import { SongsService } from './songs.service';

@Controller('songs')
export class SongsController {
  constructor(private songsService: SongsService) {}

  @Get('search')
  async search(@Query('q') query: string, @Query('category') category?: string) {
    return this.songsService.search(query, category);
  }
}
