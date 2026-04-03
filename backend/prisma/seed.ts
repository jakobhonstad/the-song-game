import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { searchDeezer } from '../src/utils/deezer';

const songs = [
  // Film soundtracks
  { title: 'My Heart Will Go On', artist: 'Celine Dion', category: 'Film', categoryDescription: 'Titanic' },
  { title: 'Skyfall', artist: 'Adele', category: 'Film', categoryDescription: 'Skyfall (James Bond)' },
  { title: 'Eye of the Tiger', artist: 'Survivor', category: 'Film', categoryDescription: 'Rocky III' },
  { title: 'I Will Always Love You', artist: 'Whitney Houston', category: 'Film', categoryDescription: 'The Bodyguard' },
  { title: 'Can You Feel the Love Tonight', artist: 'Elton John', category: 'Film', categoryDescription: 'The Lion King' },
  { title: 'Let It Go', artist: 'Idina Menzel', category: 'Film', categoryDescription: 'Frozen' },
  { title: 'Circle of Life', artist: 'Carmen Twillie', category: 'Film', categoryDescription: 'The Lion King' },
  { title: 'A Whole New World', artist: 'Peabo Bryson & Regina Belle', category: 'Film', categoryDescription: 'Aladdin' },
  { title: 'Shallow', artist: 'Lady Gaga & Bradley Cooper', category: 'Film', categoryDescription: 'A Star Is Born' },
  { title: 'Lose Yourself', artist: 'Eminem', category: 'Film', categoryDescription: '8 Mile' },

  // TV series theme songs
  { title: 'Friends Theme', artist: 'The Rembrandts', category: 'TV', categoryDescription: 'Friends' },
  { title: 'Game of Thrones Theme', artist: 'Ramin Djawadi', category: 'TV', categoryDescription: 'Game of Thrones' },
  { title: 'The Simpsons Theme', artist: 'Danny Elfman', category: 'TV', categoryDescription: 'The Simpsons' },
  { title: 'Breaking Bad Theme', artist: 'Dave Porter', category: 'TV', categoryDescription: 'Breaking Bad' },
  { title: 'Stranger Things Theme', artist: 'TV Sounds Unlimited', category: 'TV', categoryDescription: 'Stranger Things' },
  { title: 'The Office Theme', artist: 'Jay Ferguson', category: 'TV', categoryDescription: 'The Office' },
  { title: 'How I Met Your Mother Theme', artist: 'The Solids', category: 'TV', categoryDescription: 'How I Met Your Mother' },
  { title: 'Westworld Theme', artist: 'Ramin Djawadi', category: 'TV', categoryDescription: 'Westworld' },
  { title: 'The Crown Theme', artist: 'Hans Zimmer', category: 'TV', categoryDescription: 'The Crown' },
  { title: 'Peaky Blinders Theme', artist: 'Nick Cave and the Bad Seeds', category: 'TV', categoryDescription: 'Peaky Blinders' },
];

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🎵 Start seeding songs with Deezer previews...');

  for (const song of songs) {
    // Search Deezer for the song
    const deezerData = await searchDeezer(song.title, song.artist);

    const createSong = await prisma.song.upsert({
      where: {
        title_artist: {
          title: song.title, artist: song.artist
        }
      },
      update: {
        ...(deezerData && {
          previewUrl: deezerData.previewUrl,
        }),
      },
      create: {
        title: song.title,
        artist: song.artist,
        ...(deezerData && {
          previewUrl: deezerData.previewUrl,
        }),
      },
    });

    const createCategory = await prisma.category.upsert({
      where: { category: song.category },
      update: {},
      create: { category: song.category },
    });

    const createSongCategory = await prisma.songCategory.create({
      data: {
        songId: createSong.id,
        categoryId: createCategory.id,
        categoryDescription: song.categoryDescription,
      }
    });

    console.log(`✅ ${song.title} by ${song.artist} ${deezerData?.previewUrl ? '(with Deezer preview)' : '(no preview found)'}`);

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  console.log('✅ Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
