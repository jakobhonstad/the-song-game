import { prisma } from './client';

const filmSongs = [
  { title: 'Star Wars Main Theme', artist: 'John Williams', category: 'film' },
  { title: 'The Imperial March', artist: 'John Williams', category: 'film' },
  { title: 'Jurassic Park Theme', artist: 'John Williams', category: 'film' },
  { title: 'Pirates of the Caribbean Theme', artist: 'Hans Zimmer', category: 'film' },
  { title: 'The Lion King - Circle of Life', artist: 'Elton John', category: 'film' },
  { title: 'Frozen - Let It Go', artist: 'Idina Menzel', category: 'film' },
  { title: 'Harry Potter Theme', artist: 'John Williams', category: 'film' },
  { title: 'The Avengers Theme', artist: 'Alan Silvestri', category: 'film' },
  { title: 'James Bond Theme', artist: 'Monty Norman', category: 'film' },
  { title: 'Mission Impossible Theme', artist: 'Lalo Schifrin', category: 'film' },
  { title: 'Indiana Jones Theme', artist: 'John Williams', category: 'film' },
  { title: 'Back to the Future Theme', artist: 'Alan Silvestri', category: 'film' },
  { title: 'The Godfather Theme', artist: 'Nino Rota', category: 'film' },
  { title: 'Rocky Theme - Gonna Fly Now', artist: 'Bill Conti', category: 'film' },
  { title: 'Titanic - My Heart Will Go On', artist: 'Celine Dion', category: 'film' },
];

const tvSongs = [
  { title: 'Game of Thrones Theme', artist: 'Ramin Djawadi', category: 'tv' },
  { title: 'Friends Theme - I\'ll Be There For You', artist: 'The Rembrandts', category: 'tv' },
  { title: 'The Simpsons Theme', artist: 'Danny Elfman', category: 'tv' },
  { title: 'Breaking Bad Theme', artist: 'Dave Porter', category: 'tv' },
  { title: 'Stranger Things Theme', artist: 'Kyle Dixon & Michael Stein', category: 'tv' },
  { title: 'The Office Theme', artist: 'Jay Ferguson', category: 'tv' },
  { title: 'How I Met Your Mother Theme', artist: 'The Solids', category: 'tv' },
  { title: 'The Big Bang Theory Theme', artist: 'Barenaked Ladies', category: 'tv' },
  { title: 'The X-Files Theme', artist: 'Mark Snow', category: 'tv' },
  { title: 'The Fresh Prince of Bel-Air Theme', artist: 'Will Smith', category: 'tv' },
];

async function main() {
  console.log('🌱 Seeding database...');
  
  // Clear existing songs
  await prisma.song.deleteMany();
  
  // Insert film songs
  console.log('Adding film songs...');
  await prisma.song.createMany({
    data: filmSongs,
  });
  
  // Insert TV songs
  console.log('Adding TV songs...');
  await prisma.song.createMany({
    data: tvSongs,
  });
  
  const songCount = await prisma.song.count();
  console.log(`✅ Seeded ${songCount} songs`);
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
