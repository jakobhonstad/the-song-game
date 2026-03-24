import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { searchDeezer } from 'src/utils/deezer';

@Injectable()
export class GameRoundsService {
  constructor(private prisma: DatabaseService) { }

  async startGame(code: string) {
    const game = await this.prisma.game.findUnique({
      where: { code },
      include: { players: true },
    });

    if (!game) {
      throw new Error('Game not found');
    }

    // Get random songs for the rounds
    // update this function to get random songs
    // might have to use raqSQL to accomplish this
    const songs = await this.prisma.song.findMany({
      where: { category: game.category },
      take: game.maxRounds,
    });

    console.log(`🎵 [startGame] Found ${songs.length} songs for category "${game.category}"`);

    if (songs.length === 0) {
      throw new Error(`No songs found for category "${game.category}". Make sure songs are seeded in the database.`);
    }

    // Update game status
    await this.prisma.game.update({
      where: { id: game.id },
      data: { status: 'PLAYING', currentRound: 1 },
    });

    // Create rounds with songs
    const rounds: any[] = [];
    for (let i = 0; i < songs.length; i++) {
      const song = songs[i];
      const freshData = await searchDeezer(song.title, song.artist);
      const round = await this.prisma.round.create({
        data: {
          gameId: game.id,
          roundNumber: i + 1,
          songId: song.id,
          songTitle: song.title,
          songArtist: song.artist,
          category: song.category,
          previewUrl: freshData?.previewUrl || null,
        },
      });
      rounds.push(round);
    }

    console.log(`🎵 [startGame] Created ${rounds.length} rounds`);

    return this.prisma.game.findUnique({
      where: { code },
      include: {
        players: true,
        rounds: { include: { answers: true } },
      },
    });
  }

  async nextRound(code: string) {
    const game = await this.prisma.game.findUnique({
      where: { code },
      include: { rounds: true },
    });

    if (!game) {
      throw new Error('Game not found');
    }

    if (game.currentRound >= game.maxRounds) {
      return this.prisma.game.update({
        where: { id: game.id },
        data: { status: 'FINISHED' },
      });
    }

    // Move to next round
    const nextRoundNum = game.currentRound + 1;
    await this.prisma.game.update({
      where: { id: game.id },
      data: { status: 'PLAYING', currentRound: nextRoundNum },
    });
  }
}
