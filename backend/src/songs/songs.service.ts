import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SongsService {
  constructor(private prisma: PrismaService) {}

  async search(query: string, category?: string) {
    const where = {
      ...(category && { category }),
      title: {
        contains: query,
        mode: 'insensitive' as const,
      },
    };

    const songs = await this.prisma.song.findMany({
      where,
      take: 10,
    });

    return { results: songs };
  }
}
