import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class SongsService {
  constructor(private prisma: DatabaseService) { }

  async search(query: string, category?: string) {
    // Search for songs matching query
    const songCategories = await this.prisma.songCategory.findMany({
      where: {
        categoryDescription: { contains: query, mode: "insensitive" },
        category: { category }
      },
      include: { song: true },
      distinct: ['songId'],
      take: 10,
    });

    const results = songCategories.map(sc => ({
      id: String(sc.song.id),
      title: sc.categoryDescription,
      artist: sc.song.artist,
    }));



    return { results };
  }
}
