import { PrismaClient } from '@prisma/client';
import { searchDeezer } from '../src/utils/deezer';

const prisma = new PrismaClient();

const songs = [
  // Film soundtracks
  { title: 'My Heart Will Go On', artist: 'Celine Dion', category: 'film', movie: 'Titanic' },
  { title: 'Skyfall', artist: 'Adele', category: 'film', movie: 'Skyfall (James Bond)' },
  { title: 'Eye of the Tiger', artist: 'Survivor', category: 'film', movie: 'Rocky III' },
  { title: 'I Will Always Love You', artist: 'Whitney Houston', category: 'film', movie: 'The Bodyguard' },
  { title: 'Can You Feel the Love Tonight', artist: 'Elton John', category: 'film', movie: 'The Lion King' },
  { title: 'Let It Go', artist: 'Idina Menzel', category: 'film', movie: 'Frozen' },
  { title: 'Circle of Life', artist: 'Carmen Twillie', category: 'film', movie: 'The Lion King' },
  { title: 'A Whole New World', artist: 'Peabo Bryson & Regina Belle', category: 'film', movie: 'Aladdin' },
  { title: 'Shallow', artist: 'Lady Gaga & Bradley Cooper', category: 'film', movie: 'A Star Is Born' },
  { title: 'Lose Yourself', artist: 'Eminem', category: 'film', movie: '8 Mile' },
  
  // TV series theme songs
  { title: 'Friends Theme', artist: 'The Rembrandts', category: 'tv', tvShow: 'Friends' },
  { title: 'Game of Thrones Theme', artist: 'Ramin Djawadi', category: 'tv', tvShow: 'Game of Thrones' },
  { title: 'The Simpsons Theme', artist: 'Danny Elfman', category: 'tv', tvShow: 'The Simpsons' },
  { title: 'Breaking Bad Theme', artist: 'Dave Porter', category: 'tv', tvShow: 'Breaking Bad' },
  { title: 'Stranger Things Theme', artist: 'Kyle Dixon & Michael Stein', category: 'tv', tvShow: 'Stranger Things' },
  { title: 'The Office Theme', artist: 'Jay Ferguson', category: 'tv', tvShow: 'The Office' },
  { title: 'How I Met Your Mother Theme', artist: 'The Solids', category: 'tv', tvShow: 'How I Met Your Mother' },
  { title: 'Westworld Theme', artist: 'Ramin Djawadi', category: 'tv', tvShow: 'Westworld' },
  { title: 'The Crown Theme', artist: 'Hans Zimmer', category: 'tv', tvShow: 'The Crown' },
  { title: 'Peaky Blinders Theme', artist: 'Nick Cave and the Bad Seeds', category: 'tv', tvShow: 'Peaky Blinders' },
];


async function main() {
  console.log('🎵 Start seeding songs with Deezer previews...');

  for (const song of songs) {
    // Search Deezer for the song
    const deezerData = await searchDeezer(song.title, song.artist);
    
    const result = await prisma.song.upsert({
      where: { 
        title_artist: {
          title: song.title,
          artist: song.artist,
        }
      },
      update: {
        movie: 'movie' in song ? song.movie : undefined,
        tvShow: 'tvShow' in song ? song.tvShow : undefined,
        ...(deezerData && {
          previewUrl: deezerData.previewUrl,
        }),
      },
      create: {
        title: song.title,
        artist: song.artist,
        category: song.category,
        movie: 'movie' in song ? song.movie : undefined,
        tvShow: 'tvShow' in song ? song.tvShow : undefined,
        ...(deezerData && {
          previewUrl: deezerData.previewUrl,
        }),
      },
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
