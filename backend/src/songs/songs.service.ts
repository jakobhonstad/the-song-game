import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SongsService {
  constructor(private prisma: PrismaService) {}

  async search(query: string, category?: string) {
    // For film category: search by movie name
    // For tv category: search by TV show name
    // Otherwise: search by song title
    let where: any = {
      ...(category && { category }),
    };

    if (category === 'film') {
      where.movie = {
        contains: query,
        mode: 'insensitive' as const,
      };
    } else if (category === 'tv') {
      where.tvShow = {
        contains: query,
        mode: 'insensitive' as const,
      };
    } else {
      where.title = {
        contains: query,
        mode: 'insensitive' as const,
      };
    }

    const songs = await this.prisma.song.findMany({
      where,
      take: 10,
    });

    return { results: songs };
  }
}
