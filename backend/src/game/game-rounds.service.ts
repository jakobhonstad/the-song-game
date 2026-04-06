import { Injectable, NotFoundException } from '@nestjs/common';
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
    const currentCategory = await this.prisma.category.findFirst({
      where: {
        category: game.category
      }
    });

    if (!currentCategory) {
      throw new NotFoundException(`Kategori '${game.category}' finnes ikke`);
    };

    const songs = await this.prisma.song.findMany({
      where: {
        songCategories: {
          some: {
            categoryId: currentCategory.id
          }
        }
      }
    });

    console.log(`🎵 [startGame] Found ${songs.length} songs for category "${game.category}"`);

    if (songs.length === 0) {
      throw new Error(`No songs found for category "${game.category}". Make sure songs are seeded in the database.`);
    }

    const shuffled = songs.sort(() => Math.random() - 0.5);
    const selectedSongs = shuffled.slice(0, game.maxRounds);

    // Update game status
    await this.prisma.game.update({
      where: { id: game.id },
      data: { status: 'PLAYING', currentRound: 1 },
    });

    // Create rounds with songs
    // burde jeg ha noe annet en any her? kanskje lage en type
    const rounds: any[] = [];
    for (let i = 0; i < songs.length; i++) {
      const song = selectedSongs[i];
      const freshData = await searchDeezer(song.title, song.artist);
      const round = await this.prisma.round.create({
        data: {
          gameId: game.id,
          roundNumber: i + 1,
          songId: song.id,
          songTitle: song.title,
          songArtist: song.artist,
          category: currentCategory.category,
          previewUrl: freshData?.previewUrl || song.previewUrl,
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
