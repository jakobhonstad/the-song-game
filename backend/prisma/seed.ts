import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const songs = [
  { title: 'Let It Be', artist: 'The Beatles', category: 'music' },
  { title: 'Bohemian Rhapsody', artist: 'Queen', category: 'music' },
  { title: 'Imagine', artist: 'John Lennon', category: 'music' },
  { title: 'Stairway to Heaven', artist: 'Led Zeppelin', category: 'music' },
  { title: 'Hotel California', artist: 'Eagles', category: 'music' },
  { title: 'Smells Like Teen Spirit', artist: 'Nirvana', category: 'music' },
  { title: 'Sweet Child o Mine', artist: 'Guns N Roses', category: 'music' },
  { title: 'Black', artist: 'Pearl Jam', category: 'music' },
  { title: 'Wonderwall', artist: 'Oasis', category: 'music' },
  { title: 'Creep', artist: 'Radiohead', category: 'music' },
  { title: 'Seven', artist: 'Taylor Swift', category: 'music' },
  { title: 'Anti-Hero', artist: 'Taylor Swift', category: 'music' },
  { title: 'Blinding Lights', artist: 'The Weeknd', category: 'music' },
  { title: 'levitating', artist: 'Dua Lipa', category: 'music' },
  { title: 'As It Was', artist: 'Harry Styles', category: 'music' },
  { title: 'Good 4 U', artist: 'Olivia Rodrigo', category: 'music' },
  { title: 'drivers License', artist: 'Olivia Rodrigo', category: 'music' },
  { title: 'Tití Me Preguntó', artist: 'Bad Bunny', category: 'music' },
  { title: 'Pepas', artist: 'Farruko', category: 'music' },
  { title: 'Heat Waves', artist: 'Glass Animals', category: 'music' },
];

async function main() {
  console.log('Start seeding...');
  
  for (const song of songs) {
    const result = await prisma.song.upsert({
      where: { title: song.title },
      update: {},
      create: song,
    });
    console.log(`Created/updated song with id: ${result.id}`);
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
